package com.emurgo;

import android.annotation.TargetApi;
import android.app.Activity;
import android.app.KeyguardManager;
import android.content.Context;
import android.content.DialogInterface;
import android.content.Intent;
import android.hardware.fingerprint.FingerprintManager;
import android.hardware.biometrics.BiometricPrompt;
import android.os.CancellationSignal;

import com.facebook.react.bridge.ActivityEventListener;
import com.facebook.react.bridge.BaseActivityEventListener;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

import java.util.HashMap;
import java.util.Map;

import javax.crypto.Cipher;

public class KeyStoreBridge extends ReactContextBaseJavaModule {
    KeyguardManager keyguard;
    ReactApplicationContext context;

    int REQUEST_CODE_CONFIRM_DEVICE_CREDENTIALS_FOR_DECRYPTION = 44;

    Promise systemPinConfirmationPromise;
    Promise fingerprintConfirmationPromise;
    String systemPinKeyAlias;
    String systemPinEncryptedData;
    CancellationSignal fingerprintCancellation;
    private KeyStoreCrypto crypto;

    @Override
    public String getName() {
        return "KeyStoreBridge";
    }

    public KeyStoreBridge(ReactApplicationContext reactContext) {
        super(reactContext);
        this.context = reactContext;
        this.context.addActivityEventListener(activityEventListener);

        this.keyguard = (KeyguardManager) reactContext.getSystemService(Context.KEYGUARD_SERVICE);
        this.crypto = new KeyStoreCrypto(this.context, this.keyguard);
    }

    @Override
    public Map<String, Object> getConstants() {
        final Map<String, Object> constants = new HashMap<>();
        constants.put("AUTHENTIFICATION_VALIDITY_DURATION", this.crypto.AUTHENTIFICATION_VALIDITY_DURATION);

        constants.put("REJECTION_MESSAGES", Rejections.getAsMap());

        return constants;
    }

    @ReactMethod
    public void initFingerprintKeys(String keyAlias, Promise promise) {
        try {
            this.crypto.createAndroidKeyStoreAsymmetricKey(keyAlias, true, false);
        } catch (Exception e) {
            promise.reject(Rejections.KEY_NOT_CREATED, Rejections.KEY_NOT_CREATED);
            return;
        }

        promise.resolve(true);
    }

    @ReactMethod
    public void initSystemPinKeys(String keyAlias, Promise promise) {
        try {
            this.crypto.createAndroidKeyStoreAsymmetricKey(keyAlias, false, true);
        } catch (Exception e) {
            promise.reject(Rejections.KEY_NOT_CREATED, Rejections.KEY_NOT_CREATED);
            return;
        }

        promise.resolve(true);
    }

    @ReactMethod
    public void isFingerprintEncryptionHardwareSupported(Promise promise) {
        promise.resolve(this.crypto.isFingerprintEncryptionHardwareSupported());
    }

    @ReactMethod
    public void canFingerprintEncryptionBeEnabled(Promise promise) {
        promise.resolve(this.crypto.canEnableFingerprintEncryption());
    }

    @ReactMethod
    public void isBiometricPromptSupported(Promise promise) {
        promise.resolve(this.crypto.isBiometricPromptSupported());
    }

    @ReactMethod
    public void isSystemPinEncryptionSupported(Promise promise) {
        promise.resolve(this.crypto.isSystemPinEncryptionSupported());
    }

    @ReactMethod
    public void isSystemAuthSupported(Promise promise) {
        promise.resolve(this.crypto.isSystemAuthSupported());
    }

    @ReactMethod
    public void encryptData(String data, String keyAlias, final Promise promise) {
        try {
            String cipherText = this.crypto.encryptData(data, keyAlias);
            promise.resolve(cipherText);
        } catch (Exception e) {
            promise.reject(Rejections.ENCRYPTION_FAILED, Rejections.ENCRYPTION_FAILED, e);
        }
    }

    @ReactMethod
    @TargetApi(23)
    public void cancelFingerprintScanning(String reason, final Promise promise) {
        if (fingerprintConfirmationPromise == null) {
            promise.resolve(false);
            return;
        }

        fingerprintConfirmationPromise.reject(reason, reason);
        fingerprintConfirmationPromise = null;
        if (fingerprintCancellation.isCanceled()) {
            promise.resolve(true);
            return;
        }

        fingerprintCancellation.cancel();
        promise.resolve(true);
    }

    @ReactMethod
    @TargetApi(23)
    public void decryptDataWithFingerprint(final String data, String keyAlias, final Promise promise) {
        if (fingerprintConfirmationPromise != null) {
            promise.reject(Rejections.ALREADY_DECRYPTING_DATA, Rejections.ALREADY_DECRYPTING_DATA);
            return;
        }

        Cipher cipher;
        try {
            cipher = this.crypto.getDecryptCipher(keyAlias);
        } catch (Exception e) {
            promise.reject(Rejections.INVALID_KEY, Rejections.INVALID_KEY);
            return;
        }

        fingerprintConfirmationPromise = promise;

        try {
            this.fingerprintCancellation = new CancellationSignal();
            FingerprintManager.CryptoObject cryptoObject = new FingerprintManager.CryptoObject(cipher);
            FingerprintManager fingerprintManager = (FingerprintManager) this.context.getSystemService(Context.FINGERPRINT_SERVICE);
            fingerprintManager.authenticate(cryptoObject, fingerprintCancellation, 0, new FingerprintManager.AuthenticationCallback() {
                @Override
                public void onAuthenticationError(int errorCode, CharSequence errString) {
                    if (!fingerprintCancellation.isCanceled()) {
                        fingerprintCancellation.cancel();

                        if (errorCode == FingerprintManager.FINGERPRINT_ERROR_LOCKOUT || errorCode == FingerprintManager.FINGERPRINT_ERROR_LOCKOUT_PERMANENT) {
                            promise.reject(Rejections.SENSOR_LOCKOUT, Rejections.SENSOR_LOCKOUT);
                        } else {
                            promise.reject(Rejections.NOT_RECOGNIZED, Rejections.NOT_RECOGNIZED);
                        }
                        fingerprintConfirmationPromise = null;
                    }
                }

                @Override
                public void onAuthenticationHelp(int helpCode, CharSequence helpString) {
                    // pass this is recoverable
                }

                @Override
                public void onAuthenticationSucceeded(FingerprintManager.AuthenticationResult result) {
                    if (!fingerprintCancellation.isCanceled()) {
                        FingerprintManager.CryptoObject cipher = result.getCryptoObject();
                        try {
                            String decodedText = crypto.decryptData(data, cipher.getCipher());
                            promise.resolve(decodedText);
                        } catch (Exception e) {
                            promise.reject(Rejections.DECRYPTION_FAILED, Rejections.DECRYPTION_FAILED, e);
                        } finally {
                            fingerprintCancellation.cancel();
                            fingerprintConfirmationPromise = null;
                        }
                    }
                }

                @Override
                public void onAuthenticationFailed() {
                    if (fingerprintCancellation.isCanceled()) {
                        return;
                    }

                    fingerprintCancellation.cancel();
                    promise.reject(Rejections.NOT_RECOGNIZED, Rejections.NOT_RECOGNIZED);
                    fingerprintConfirmationPromise = null;
                }
            }, null);
        } catch (Exception e) {
            promise.reject(Rejections.DECRYPTION_FAILED, Rejections.DECRYPTION_FAILED, e);
            fingerprintConfirmationPromise = null;
        }
    }

    @ReactMethod
    public void decryptDataWithSystemPin(final String data, String keyAlias, String message, final Promise promise) {
        if (!this.crypto.isSystemAuthSupported()) {
            promise.reject(Rejections.SYSTEM_AUTH_NOT_SUPPORTED, Rejections.SYSTEM_AUTH_NOT_SUPPORTED);
            return;
        }

        Intent intent = this.keyguard.createConfirmDeviceCredentialIntent(null, message);
        if (intent != null) {
            this.systemPinConfirmationPromise = promise;
            this.systemPinKeyAlias = keyAlias;
            this.systemPinEncryptedData = data;
            this.context.startActivityForResult(intent, REQUEST_CODE_CONFIRM_DEVICE_CREDENTIALS_FOR_DECRYPTION, null);
        } else {
            promise.reject(Rejections.FAILED_UNKNOWN_ERROR, Rejections.FAILED_UNKNOWN_ERROR);
        }
    }

    @ReactMethod
    public void deleteAndroidKeyStoreAsymmetricKeyPair(String keyAlias, Promise promise) {
        try {
            this.crypto.deleteAndroidKeyStoreAsymmetricKeyPair(keyAlias);
            promise.resolve(true);
        } catch (Exception e) {
            promise.reject(Rejections.KEY_NOT_DELETED, Rejections.KEY_NOT_DELETED, e);
        }
    }

    private final ActivityEventListener activityEventListener = new BaseActivityEventListener() {
        @Override
        public void onActivityResult(Activity activity, int requestCode, int resultCode, Intent intent) {
            if (requestCode == REQUEST_CODE_CONFIRM_DEVICE_CREDENTIALS_FOR_DECRYPTION) {
                if (systemPinConfirmationPromise != null) {
                    if (resultCode == Activity.RESULT_CANCELED) {
                        systemPinConfirmationPromise.reject(Rejections.CANCELED, Rejections.CANCELED);
                    } else if (resultCode == Activity.RESULT_OK) {
                        try {
                            String decodedText = crypto.decryptData(systemPinEncryptedData, systemPinKeyAlias);
                            systemPinConfirmationPromise.resolve(decodedText);

                        } catch (Exception e) {
                            systemPinConfirmationPromise.reject(Rejections.FAILED, Rejections.FAILED, e);
                        }
                    } else {
                        systemPinConfirmationPromise.reject(Rejections.FAILED_UNKNOWN_ERROR, Rejections.FAILED_UNKNOWN_ERROR);
                    }

                    systemPinConfirmationPromise = null;
                    systemPinKeyAlias = null;
                    systemPinEncryptedData = null;
                }
            }
        }
    };

    @ReactMethod
    public void isKeyValid(String keyAlias, final Promise promise) {
        try {
            this.crypto.getDecryptCipher(keyAlias);
            promise.resolve(true);
        } catch (Exception e) {
            promise.resolve(false);
        }
    }

    @TargetApi(28)
    @ReactMethod
    public void decryptDataWithBiometricPrompt(
        final String data,
        String keyAlias,
        String title,
        String description,
        String subtitle,
        String negativeButtonText,
        final Promise promise
    ) throws Exception {
        if (fingerprintConfirmationPromise != null) {
            promise.reject(Rejections.ALREADY_DECRYPTING_DATA, Rejections.ALREADY_DECRYPTING_DATA);
            return;
        }

        Cipher cipher;
        try {
            cipher = this.crypto.getDecryptCipher(keyAlias);
        } catch (Exception e) {
            promise.reject(Rejections.INVALID_KEY, Rejections.INVALID_KEY);
            return;
        }

        fingerprintConfirmationPromise = promise;
        this.fingerprintCancellation = new CancellationSignal();

        final BiometricPrompt.AuthenticationCallback biometricCallback = new BiometricPrompt.AuthenticationCallback() {
            @Override
            public void onAuthenticationSucceeded(BiometricPrompt.AuthenticationResult result) {
                if (!fingerprintCancellation.isCanceled()) {
                    BiometricPrompt.CryptoObject cipher = result.getCryptoObject();
                    try {
                        String decodedText = crypto.decryptData(data, cipher.getCipher());
                        fingerprintConfirmationPromise.resolve(decodedText);
                    } catch (Exception e) {
                        fingerprintConfirmationPromise.reject(Rejections.DECRYPTION_FAILED, Rejections.DECRYPTION_FAILED, e);
                    } finally {
                        fingerprintCancellation.cancel();
                        fingerprintConfirmationPromise = null;
                    }
                }
            }

            @Override
            public void onAuthenticationHelp(int helpCode, CharSequence helpString) {
                // this is recoverable
            }

            @Override
            public void onAuthenticationError(int errorCode, CharSequence errString) {
                if (!fingerprintCancellation.isCanceled()) {
                    fingerprintCancellation.cancel();
                }

                if (errorCode == BiometricPrompt.BIOMETRIC_ERROR_LOCKOUT) {
                    fingerprintConfirmationPromise.reject(Rejections.SENSOR_LOCKOUT, Rejections.SENSOR_LOCKOUT);
                } else if (errorCode == BiometricPrompt.BIOMETRIC_ERROR_LOCKOUT_PERMANENT) {
                    fingerprintConfirmationPromise.reject(Rejections.SENSOR_LOCKOUT_PERMANENT, Rejections.SENSOR_LOCKOUT_PERMANENT);
                } else {
                    fingerprintConfirmationPromise.reject(Rejections.FAILED_UNKNOWN_ERROR, Rejections.FAILED_UNKNOWN_ERROR);
                }

                fingerprintConfirmationPromise = null;
            }
        };

        new BiometricPrompt.Builder(context)
                .setTitle(title)
                .setSubtitle(subtitle)
                .setDescription(description)
                .setNegativeButton(negativeButtonText, context.getMainExecutor(), new DialogInterface.OnClickListener() {
                    @Override
                    public void onClick(DialogInterface dialogInterface, int i) {
                        fingerprintCancellation.cancel();
                        promise.reject(Rejections.CANCELED, Rejections.CANCELED);
                        fingerprintConfirmationPromise = null;
                    }
                })
                .build()
                .authenticate(new BiometricPrompt.CryptoObject(cipher), fingerprintCancellation, context.getMainExecutor(), biometricCallback);
    }
}