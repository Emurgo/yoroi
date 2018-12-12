package com.emurgo;

import org.json.JSONObject;

import java.util.HashMap;
import java.util.Map;

public final class Rejections {

    // encryptData
    public static final String ENCRYPTION_FAILED = "ENCRYPTION_FAILED";

    // decryptDataWithFingerprint
    public static final String ALREADY_DECRYPTING_DATA = "ALREADY_DECRYPTING_DATA";
    public static final String SENSOR_LOCKOUT = "SENSOR_LOCKOUT";
    public static final String SENSOR_LOCKOUT_PERMANENT = "SENSOR_LOCKOUT_PERMANENT";
    public static final String NOT_RECOGNIZED = "NOT_RECOGNIZED";
    public static final String DECRYPTION_FAILED = "DECRYPTION_FAILED";
    // any custom code, message sent from JS

    // decryptDataWithSystemPin
    public static final String SYSTEM_AUTH_NOT_SUPPORTED = "SYSTEM_AUTH_NOT_SUPPORTED";
    public static final String FAILED_UNKNOWN_ERROR = "FAILED_UNKNOWN_ERROR";
    public static final String CANCELED = "CANCELED";
    public static final String FAILED = "FAILED";

    public static final String INVALID_KEY = "INVALID_KEY";
    public static final String SWAPPED_TO_FALLBACK = "SWAPPED_TO_FALLBACK";

    // deleteAndroidKeyStoreAsymmetricKeyPair
    public static final String KEY_NOT_DELETED = "KEY_NOT_DELETED";
    public static final String KEY_NOT_CREATED = "KEY_NOT_CREATED";

    private Rejections() { }

    public static final Map<String, Object> getAsMap() {
        Map<String, Object> map = new HashMap<>();
        map.put(ENCRYPTION_FAILED, ENCRYPTION_FAILED);
        map.put(ALREADY_DECRYPTING_DATA, ALREADY_DECRYPTING_DATA);
        map.put(SENSOR_LOCKOUT, SENSOR_LOCKOUT);
        map.put(SENSOR_LOCKOUT_PERMANENT, SENSOR_LOCKOUT_PERMANENT);
        map.put(NOT_RECOGNIZED, NOT_RECOGNIZED);
        map.put(DECRYPTION_FAILED, DECRYPTION_FAILED);
        map.put(SYSTEM_AUTH_NOT_SUPPORTED, SYSTEM_AUTH_NOT_SUPPORTED);
        map.put(FAILED_UNKNOWN_ERROR, FAILED_UNKNOWN_ERROR);
        map.put(CANCELED, CANCELED);
        map.put(FAILED, FAILED);
        map.put(INVALID_KEY, INVALID_KEY);
        map.put(KEY_NOT_DELETED, KEY_NOT_DELETED);
        map.put(SWAPPED_TO_FALLBACK, SWAPPED_TO_FALLBACK);
        map.put(KEY_NOT_CREATED, KEY_NOT_CREATED);

        return map;
    }
}