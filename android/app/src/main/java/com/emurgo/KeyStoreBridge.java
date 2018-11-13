package com.emurgo;

import android.annotation.TargetApi;
import android.app.Activity;
import android.app.KeyguardManager;
import android.content.Context;
import android.content.Intent;
import android.hardware.fingerprint.FingerprintManager;
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

    int REQUEST_CODE_CONFIRM_DEVICE_CREDENTIALS = 44;

    Promise systemPinConfirmationPromise;
    String systemPinKeyAlias;
    String systemPinEncryptedData;
    private boolean fingerprintDecryptionInProcess = false;
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
        return constants;
    }

    @ReactMethod
    public void initFingerprintKeys(String keyAlias, Promise promise) {
        try {
            this.crypto.createAndroidKeyStoreAsymmetricKey(keyAlias, true, false);
        } catch (Exception e) {
            promise.resolve(false);
            return;
        }

        promise.resolve(true);
    }

    @ReactMethod
    public void initSystemPinKeys(String keyAlias, Promise promise) {
        try {
            this.crypto.createAndroidKeyStoreAsymmetricKey(keyAlias, false, true);
        } catch (Exception e) {
            promise.resolve(false);
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
    public void isSystemPinEncryptionSupported(Promise promise) {
        promise.resolve(this.crypto.isSystemPinEncryptionSupported());
    }

    @ReactMethod
    public void isSystemAuthSupported(Promise promise) {
        promise.resolve(this.crypto.isSystemAuthSupported());
    }

    /*
        This call can be rejected with this messages:
        ENCRYPTION_FAILED
    */
    @ReactMethod
    public void encryptData(String data, String keyAlias, final Promise promise) {
        try {
            String cipherText = this.crypto.encryptData(data, keyAlias);
            promise.resolve(cipherText);
        } catch (Exception e) {
            promise.reject("ENCRYPTION_FAILED", "ENCRYPTION_FAILED", e);
        }
    }

    /*
        This call can be rejected with this messages:
        ALREADY_DECRYPTING_DATA
        AUTH_FAILED
        DECRYPTION_FAILED
    */
    @ReactMethod
    @TargetApi(23)
    public void decryptDataWithFingerprint(final String data, String keyAlias, final Promise promise) {
        if (fingerprintDecryptionInProcess ) {
            promise.reject("ALREADY_DECRYPTING_DATA", "ALREADY_DECRYPTING_DATA");
            return;
        }
        fingerprintDecryptionInProcess = true;

        try {
            Cipher cipher = this.crypto.getDecryptCipher(keyAlias);

            final CancellationSignal cancellationSignal = new CancellationSignal();
            FingerprintManager.CryptoObject cryptoObject = new FingerprintManager.CryptoObject(cipher);
            FingerprintManager fingerprintManager = (FingerprintManager) this.context.getSystemService(Context.FINGERPRINT_SERVICE);
            fingerprintManager.authenticate(cryptoObject, cancellationSignal, 0, new FingerprintManager.AuthenticationCallback() {
                @Override
                public void onAuthenticationError(int errorCode, CharSequence errString) {
                    if (!cancellationSignal.isCanceled()) {
                        cancellationSignal.cancel();
                        promise.reject("AUTH_FAILED", String.valueOf(errorCode) + " " + errString.toString());
                        fingerprintDecryptionInProcess = false;
                    }
                }

                @Override
                public void onAuthenticationHelp(int helpCode, CharSequence helpString) {
                    // pass this is recoverable
                }

                @Override
                public void onAuthenticationSucceeded(FingerprintManager.AuthenticationResult result) {
                    if (!cancellationSignal.isCanceled()) {
                        FingerprintManager.CryptoObject cipher = result.getCryptoObject();
                        try {
                            String decodedText = crypto.decryptData(data, cipher.getCipher());
                            promise.resolve(decodedText);
                        } catch (Exception e) {
                            promise.reject("DECRYPTION_FAILED", "DECRYPTION_FAILED", e);
                        } finally {
                            cancellationSignal.cancel();
                        }
                        fingerprintDecryptionInProcess = false;
                    }
                }

                @Override
                public void onAuthenticationFailed() {
                    if (cancellationSignal.isCanceled()) {
                        return;
                    }

                    cancellationSignal.cancel();
                    promise.reject("AUTH_FAILED", "AUTH_FAILED");
                    fingerprintDecryptionInProcess = false;
                }
            }, null);
        } catch (Exception e) {
            promise.reject("DECRYPTION_FAILED", "DECRYPTION_FAILED", e);
            fingerprintDecryptionInProcess = false;
        }
    }

    /*
        This call can be rejected with this messages:
        SYSTEM_AUTH_NOT_SUPPORTED
        FAILED_UNKNOWN_ERROR
        CANCELED
        FAILED
    */
    @ReactMethod
    public void decryptDataWithSystemPin(final String data, String keyAlias, final Promise promise) {
        if (!this.crypto.isSystemAuthSupported()) {
            promise.reject("SYSTEM_AUTH_NOT_SUPPORTED", "SYSTEM_AUTH_NOT_SUPPORTED");
            return;
        }
        
        Intent intent = this.keyguard.createConfirmDeviceCredentialIntent(null, null);
        if (intent != null) {
            this.systemPinConfirmationPromise = promise;
            this.systemPinKeyAlias = keyAlias;
            this.systemPinEncryptedData = data;
            this.context.startActivityForResult(intent, REQUEST_CODE_CONFIRM_DEVICE_CREDENTIALS, null);
        } else {
            promise.reject("FAILED_UNKNOWN_ERROR", "FAILED_UNKNOWN_ERROR");
        }
    }

    /*
        This call can be rejected with this messages:
        KEY_NOT_DELETED
    */
    @ReactMethod
    public void deleteAndroidKeyStoreAsymmetricKeyPair(String keyAlias, Promise promise) {
        try {
            this.crypto.deleteAndroidKeyStoreAsymmetricKeyPair(keyAlias);
            promise.resolve(true);
        } catch (Exception e) {
            promise.reject("KEY_NOT_DELETED", "KEY_NOT_DELETED", e);
        }
    }

    private final ActivityEventListener activityEventListener = new BaseActivityEventListener() {
        @Override
        public void onActivityResult(Activity activity, int requestCode, int resultCode, Intent intent) {
            if (requestCode == REQUEST_CODE_CONFIRM_DEVICE_CREDENTIALS) {
                if (systemPinConfirmationPromise != null) {
                    if (resultCode == Activity.RESULT_CANCELED) {
                        systemPinConfirmationPromise.reject("CANCELED", "CANCELED");
                    } else if (resultCode == Activity.RESULT_OK) {
                        try {
                            String decodedText = crypto.decryptData(systemPinEncryptedData, systemPinKeyAlias);
                            systemPinConfirmationPromise.resolve(decodedText);

                        } catch (Exception e) {
                            systemPinConfirmationPromise.reject("FAILED", "FAILED", e);
                        }
                    } else {
                        systemPinConfirmationPromise.reject("FAILED_UNKNOWN_ERROR", "FAILED_UNKNOWN_ERROR");
                    }

                    systemPinConfirmationPromise = null;
                    systemPinKeyAlias = null;
                    systemPinEncryptedData = null;
                }
            }
        }
    };
}