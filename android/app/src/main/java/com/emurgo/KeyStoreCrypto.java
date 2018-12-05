package com.emurgo;

import android.annotation.TargetApi;
import android.app.KeyguardManager;
import android.content.Context;
import android.content.pm.PackageManager;
import android.hardware.fingerprint.FingerprintManager;
import android.os.Build;
import android.security.KeyPairGeneratorSpec;
import android.security.keystore.KeyGenParameterSpec;
import android.security.keystore.KeyProperties;
import android.util.Base64;

import com.facebook.react.bridge.ReactApplicationContext;

import java.math.BigInteger;
import java.nio.charset.StandardCharsets;
import java.security.KeyFactory;
import java.security.KeyPair;
import java.security.KeyPairGenerator;
import java.security.KeyStore;
import java.security.PrivateKey;
import java.security.PublicKey;
import java.security.spec.X509EncodedKeySpec;
import java.text.MessageFormat;
import java.util.Calendar;

import javax.crypto.Cipher;
import javax.security.auth.x500.X500Principal;

public class KeyStoreCrypto {
    /* The only option here is RSA because of our requirements
       of supporting api 21+
       https://developer.android.com/training/articles/keystore#SupportedCiphers
    */
    String cipherAlgo = KeyProperties.KEY_ALGORITHM_RSA;
    String cipherBlockMode = KeyProperties.BLOCK_MODE_ECB;
    String cipherPadding = KeyProperties.ENCRYPTION_PADDING_RSA_PKCS1;

    String TRANSFORMATION_ASYMMETRIC = cipherAlgo + "/" + cipherBlockMode + "/" + cipherPadding;
    public int AUTHENTIFICATION_VALIDITY_DURATION = 4;

    private static final String FEATURE_IRIS = "android.hardware.iris";
    private static final String FEATURE_FACE = "android.hardware.face";

    KeyguardManager keyguard;
    ReactApplicationContext context;

    KeyStoreCrypto(ReactApplicationContext context, KeyguardManager keyguard) {
        this.context = context;
        this.keyguard = keyguard;
    }

    public String decryptData(String encryptedData, String keyAlias) throws Exception {
        Cipher cipher = this.getDecryptCipher(keyAlias);

        return this.decryptData(encryptedData, cipher);
    }

    public String decryptData(String encryptedData, Cipher cipher) throws Exception {
        byte[] encryptedBytes = Base64.decode(encryptedData, Base64.DEFAULT);
        String decodedText = new String(cipher.doFinal(encryptedBytes), StandardCharsets.UTF_8);

        return decodedText;
    }

    private KeyPair getAndroidKeyStoreAsymmetricKeyPair(String keyAlias) throws Exception {
        KeyStore keyStore;
        keyStore = KeyStore.getInstance("AndroidKeyStore");
        keyStore.load(null);

        KeyStore.Entry entry = keyStore.getEntry(keyAlias, null);
        PrivateKey privateKey = ((KeyStore.PrivateKeyEntry) entry).getPrivateKey();
        PublicKey publicKey = keyStore.getCertificate(keyAlias).getPublicKey();

        return new KeyPair(publicKey, privateKey);
    }

    public String encryptData(String data, String keyAlias) throws Exception {
        Cipher cipher = Cipher.getInstance(this.TRANSFORMATION_ASYMMETRIC);
        KeyPair keyPair = this.getAndroidKeyStoreAsymmetricKeyPair(keyAlias);
        // https://stackoverflow.com/a/47941645/2599892
        PublicKey pk = KeyFactory.getInstance(this.cipherAlgo).generatePublic(new X509EncodedKeySpec(keyPair.getPublic().getEncoded()));
        cipher.init(Cipher.ENCRYPT_MODE, pk);
        byte[] bytes  = cipher.doFinal(data.getBytes());
        return Base64.encodeToString(bytes, Base64.DEFAULT);
    }

    public KeyPair createAndroidKeyStoreAsymmetricKey(String keyAlias, boolean fingerprintProtect, boolean systemPinProtect) throws Exception {
        KeyPairGenerator generator = KeyPairGenerator.getInstance(cipherAlgo, "AndroidKeyStore");

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            generator = this.initGeneratorWithParameterSpec(generator, keyAlias, fingerprintProtect, systemPinProtect);
        } else {
            generator = this.initGeneratorWithSpec(generator, keyAlias);
        }

        // Generates Key with given spec and saves it to the KeyStore
        return generator.generateKeyPair();
    }

    // API < 23
    private KeyPairGenerator initGeneratorWithSpec(KeyPairGenerator generator, String alias) throws Exception {
        Calendar startDate = Calendar.getInstance();
        Calendar endDate = Calendar.getInstance();
        endDate.add(Calendar.YEAR, 1000);

        Object[] params = new Object[]{alias};
        String certificateParams = MessageFormat.format("CN={0} CA Certificate", params);
        KeyPairGeneratorSpec.Builder builder = new KeyPairGeneratorSpec.Builder(context)
                .setAlias(alias)
                .setSerialNumber(BigInteger.ONE)
                .setSubject(new X500Principal(certificateParams))
                .setStartDate(startDate.getTime())
                .setEndDate(endDate.getTime());

        generator.initialize(builder.build());
        return generator;
    }

    @TargetApi(23)
    private KeyPairGenerator initGeneratorWithParameterSpec(KeyPairGenerator generator, String keyAlias, boolean fingerPrintProtect, boolean systemPinProtect) throws Exception {
        KeyGenParameterSpec.Builder builder = new KeyGenParameterSpec.Builder(keyAlias, KeyProperties.PURPOSE_ENCRYPT | KeyProperties.PURPOSE_DECRYPT)
                .setBlockModes(cipherBlockMode)
                .setEncryptionPaddings(cipherPadding);

        builder.setUserAuthenticationRequired(true);

        if (fingerPrintProtect) {
            // -1 means we have to use fingerprints every time
            builder.setUserAuthenticationValidityDurationSeconds(-1);

            // From the api 24 we can disable fingerprint invalidation on new fingerprint enrollment
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
                builder.setInvalidatedByBiometricEnrollment(false);
            }
        }

        if (systemPinProtect) {
            builder.setUserAuthenticationValidityDurationSeconds(this.AUTHENTIFICATION_VALIDITY_DURATION);
        }

        generator.initialize(builder.build());
        return generator;
    }

    public boolean deleteAndroidKeyStoreAsymmetricKeyPair(String keyAlias) throws Exception {
        KeyStore keyStore;
        keyStore = KeyStore.getInstance("AndroidKeyStore");
        keyStore.load(null);

        if (keyStore.isKeyEntry(keyAlias)) {
            keyStore.deleteEntry(keyAlias);
            return true;
        } else {
            return false;
        }
    }

    public Cipher getDecryptCipher(String keyAlias) throws Exception {
        Cipher cipher = Cipher.getInstance(this.TRANSFORMATION_ASYMMETRIC);
        KeyPair keyPair = this.getAndroidKeyStoreAsymmetricKeyPair(keyAlias);
        cipher.init(Cipher.DECRYPT_MODE, keyPair.getPrivate());
        return cipher;
    }

    public boolean isSystemPinEncryptionSupported() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            return this.keyguard.isDeviceSecure();
        }

        return false;
    }

    public boolean isBiometricPromptSupported() {
        boolean fingerprintSupport = this.context.getPackageManager().hasSystemFeature(PackageManager.FEATURE_FINGERPRINT);
        boolean irisSupport = this.context.getPackageManager().hasSystemFeature(FEATURE_IRIS);
        boolean faceSupport = this.context.getPackageManager().hasSystemFeature(FEATURE_FACE);
        return (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P && (irisSupport || faceSupport || fingerprintSupport));
    }

    public boolean isSystemAuthSupported() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            return this.keyguard.isDeviceSecure();
        }

        return this.keyguard.isKeyguardSecure();
    }

    public boolean isFingerprintEncryptionHardwareSupported() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            FingerprintManager fingerprintManager = (FingerprintManager) this.context.getSystemService(Context.FINGERPRINT_SERVICE);

            if (fingerprintManager == null) {
                return false;
            }

            return fingerprintManager.isHardwareDetected();
        }

        return false;
    }

    public boolean canEnableFingerprintEncryption() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            FingerprintManager fingerprintManager = (FingerprintManager) this.context.getSystemService(Context.FINGERPRINT_SERVICE);

            if (fingerprintManager == null) {
                return false;
            }

            return this.keyguard.isDeviceSecure() &&
                    fingerprintManager.isHardwareDetected() &&
                    fingerprintManager.hasEnrolledFingerprints();
        }

        return false;
    }
}
