# Yoroi Wallet - Encryption Compliance Documentation

## Apple App Store Compliance Statement

**Application Name:** Yoroi Wallet  
**Developer:** EMURGO  
**Date:** September 2025  
**Purpose:** Encryption compliance documentation for Apple App Store submission

---

## Executive Summary

Yoroi Wallet is a cryptocurrency wallet application that implements robust encryption mechanisms to protect user private keys and sensitive data stored locally on the device. This document provides a comprehensive technical overview of the encryption implementations used within the application to ensure compliance with Apple's App Store encryption requirements.

**Answer to Apple's Question: "Does your app use encryption?"**  
**YES** - Yoroi Wallet uses encryption to protect private keys and sensitive wallet data stored locally on the device.

---

## 1. Encryption Purpose and Scope

### 1.1 Primary Use Cases

Yoroi Wallet implements encryption for the following purposes:

1. **Private Key Protection**: Encrypting cryptocurrency private keys stored locally on the device
2. **Wallet Data Security**: Protecting sensitive wallet information and transaction data
3. **User Authentication**: Securing biometric and password-based authentication data
4. **Local Storage Security**: Encrypting sensitive data stored in device keychain and local storage

### 1.2 Data Types Encrypted

- Cryptocurrency private keys (root keys, signing keys)
- Wallet metadata and configuration data
- User authentication credentials
- Transaction signing data
- Catalyst voting registration data

---

## 2. Cryptographic Implementation Details

### 2.1 Core Encryption Libraries

#### 2.1.1 Cardano Serialization Library (CSL)

- **Library**: `@emurgo/cardano-serialization-lib-nodejs` (v14.1.2)
- **Purpose**: Core cryptographic operations for Cardano blockchain
- **Implementation**: WebAssembly-based cryptographic functions
- **Key Functions**: `encrypt_with_password()`, `decrypt_with_password()`

#### 2.1.2 Noble Ciphers

- **Library**: `@noble/ciphers` (v1.3.0)
- **Purpose**: Modern cryptographic primitives
- **Algorithms**: ChaCha20-Poly1305 authenticated encryption
- **Implementation**: Pure JavaScript cryptographic library

#### 2.1.3 React Native Quick Crypto

- **Library**: `react-native-quick-crypto` (v0.7.13)
- **Purpose**: Native cryptographic operations
- **Functions**: PBKDF2 key derivation, random number generation
- **Platform**: Cross-platform native crypto implementation

### 2.2 Encryption Algorithms and Standards

#### 2.2.1 Primary Encryption Scheme

**Algorithm**: ChaCha20-Poly1305 (AEAD - Authenticated Encryption with Associated Data)

- **Key Size**: 256 bits (32 bytes)
- **Nonce Size**: 96 bits (12 bytes)
- **Authentication Tag**: 128 bits (16 bytes)
- **Standard**: RFC 8439 (ChaCha20 and Poly1305 for IETF Protocols)

#### 2.2.2 Key Derivation Function

**Algorithm**: PBKDF2 (Password-Based Key Derivation Function 2)

- **Hash Function**: SHA-512
- **Iterations**: 12,983 (for Catalyst voting data)
- **Salt Size**: 128 bits (16 bytes)
- **Standard**: RFC 2898 (PKCS #5: Password-Based Cryptography Specification)

#### 2.2.3 Random Number Generation

- **Source**: Cryptographically secure random number generator
- **Implementation**: `crypto.getRandomValues()` (Web Crypto API)
- **Platform**: Native random number generation via `react-native-get-random-values`

### 2.3 Encryption Process Flow

#### 2.3.1 Private Key Encryption

```
1. User provides password (UTF-8 string)
2. Generate random salt (64 bytes)
3. Generate random nonce (24 bytes)
4. Derive encryption key using PBKDF2-SHA512
5. Encrypt private key using ChaCha20-Poly1305
6. Store encrypted data with salt and nonce
```

#### 2.3.2 Data Format

```
| Protocol Version (1 byte) | Salt (16 bytes) | Nonce (12 bytes) | Encrypted Data | Authentication Tag (16 bytes) |
```

---

## 3. Storage and Key Management

### 3.1 Secure Storage Implementation

#### 3.1.1 iOS Keychain Integration

- **Library**: `react-native-keychain` (v10.0.0)
- **Purpose**: Secure storage of encrypted private keys
- **Features**:
  - Hardware-backed security (Secure Enclave on supported devices)
  - Biometric authentication integration
  - OS-level keychain protection

#### 3.1.2 Local Encrypted Storage

- **Implementation**: Custom encrypted storage layer
- **Location**: Device local storage with encryption
- **Protection**: All sensitive data encrypted before storage

### 3.2 Key Management Architecture

#### 3.2.1 Master Password System

- **User Input**: User-defined password
- **Derivation**: PBKDF2-based key derivation
- **Storage**: Never stored in plaintext
- **Usage**: Used to encrypt/decrypt private keys

#### 3.2.2 Biometric Authentication

- **Library**: `expo-local-authentication` (v16.0.5)
- **Purpose**: Additional authentication layer
- **Integration**: Works with iOS Keychain for secure access
- **Fallback**: PIN/passcode fallback available

---

## 4. Security Features and Protections

### 4.1 Authentication Mechanisms

1. **Password-based Authentication**: User-defined master password
2. **Biometric Authentication**: Touch ID / Face ID integration
3. **PIN Fallback**: Device PIN as authentication fallback
4. **Session Management**: Automatic logout and re-authentication

### 4.2 Data Protection Measures

1. **Encryption at Rest**: All private keys encrypted before storage
2. **Secure Key Derivation**: PBKDF2 with high iteration count
3. **Authenticated Encryption**: ChaCha20-Poly1305 prevents tampering
4. **Random Salt/Nonce**: Unique values for each encryption operation

### 4.3 Platform Security Integration

1. **iOS Keychain**: Hardware-backed secure storage
2. **Secure Enclave**: Hardware security module integration (where available)
3. **App Transport Security**: HTTPS-only network communications
4. **Code Obfuscation**: Production builds use code protection

---

## 5. Compliance and Standards

### 5.1 Cryptographic Standards Compliance

- **FIPS 140-2**: Algorithms used are FIPS-approved
- **NIST Guidelines**: Follows NIST cryptographic recommendations
- **RFC Standards**: Implements standardized cryptographic protocols
- **Industry Best Practices**: Follows cryptocurrency wallet security standards

### 5.2 Apple Platform Compliance

- **iOS Security Framework**: Integrates with iOS security features
- **App Store Guidelines**: Complies with Apple's encryption disclosure requirements
- **Privacy Standards**: Follows Apple's privacy and data protection guidelines

---

## 6. Technical Implementation Details

### 6.1 Code Architecture

```
src/kernel/crypto/
├── encrypt-data.ts          # Main encryption functions
├── decrypt-data.ts          # Main decryption functions
├── csl.ts                   # Cardano Serialization Library interface
└── random-hex-string.ts     # Cryptographically secure random generation

src/kernel/storage/
├── EncryptedStorage.ts      # Encrypted storage implementation
└── KeychainStorage.ts       # iOS Keychain integration

src/wallets/cardano/catalyst/
└── catalystCipher.ts        # ChaCha20-Poly1305 implementation
```

### 6.2 Key Security Properties

1. **Confidentiality**: Private keys encrypted with strong algorithms
2. **Integrity**: Authenticated encryption prevents data tampering
3. **Authentication**: Multiple authentication layers
4. **Non-repudiation**: Cryptographic signatures for transactions

---

## 7. Risk Assessment and Mitigation

### 7.1 Identified Risks

1. **Password Weakness**: User-defined passwords may be weak
2. **Device Compromise**: Physical access to unlocked device
3. **Memory Dumps**: Private keys in memory during operations

### 7.2 Mitigation Strategies

1. **Password Requirements**: Encourages strong password usage
2. **Biometric Protection**: Additional authentication layer
3. **Memory Management**: Secure memory clearing after operations
4. **Session Timeouts**: Automatic logout for inactive sessions

---

## 8. Legal and Regulatory Compliance

### 8.1 Export Control Compliance

- **EAR Classification**: Software uses standard cryptographic algorithms
- **Export License**: Not required for standard encryption (EAR 740.17)
- **Compliance**: Follows US export control regulations

### 8.2 Data Protection Compliance

- **GDPR**: Implements data minimization and user control
- **CCPA**: Provides user data access and deletion capabilities
- **Local Laws**: Complies with applicable local data protection laws

---

## 9. Conclusion

Yoroi Wallet implements industry-standard encryption to protect user private keys and sensitive data. The application uses proven cryptographic algorithms (ChaCha20-Poly1305, PBKDF2-SHA512) and integrates with platform security features (iOS Keychain, Secure Enclave) to provide robust protection for cryptocurrency assets.

The encryption implementation is:

- **Standards-compliant**: Uses FIPS-approved algorithms
- **Platform-integrated**: Leverages iOS security features
- **User-controlled**: Users maintain control of their encryption keys
- **Transparent**: Open-source implementation allows security review

This encryption is essential for the secure operation of a cryptocurrency wallet and is used solely for protecting user data and private keys stored locally on the device.

---

**Document Prepared By:** EMURGO Development Team  
**Technical Review:** Security Team  
**Legal Review:** Compliance Team  
**Date:** September 2025
**Version:** 1.0

---

*This document is prepared for Apple App Store compliance purposes and provides a comprehensive technical overview of encryption usage within the Yoroi Wallet application.*
