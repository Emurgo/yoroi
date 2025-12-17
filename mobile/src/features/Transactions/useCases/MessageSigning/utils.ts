import {Buffer} from 'buffer'
import {decode} from 'cbor2'

/**
 * Extract the raw Ed25519 public key from a COSE key (CBOR format)
 * The public key is stored at label -2 in the COSE key map
 */
export const extractPublicKeyFromCoseKey = (coseKeyHex: string): string => {
  try {
    const coseKeyBytes = Buffer.from(coseKeyHex, 'hex')
    const coseKey = decode(coseKeyBytes) as Map<number | string, unknown>

    // Label -2 contains the public key (x coordinate for Ed25519)
    const publicKeyEntry = coseKey.get(-2)
    if (!publicKeyEntry) {
      throw new Error('Public key not found in COSE key')
    }

    const publicKeyBuffer = Buffer.from(publicKeyEntry as Uint8Array)
    return publicKeyBuffer.toString('hex')
  } catch (error) {
    throw new Error(
      `Failed to extract public key: ${error instanceof Error ? error.message : 'Unknown error'}`,
    )
  }
}

/**
 * Extract public key from either COSE key format or raw public key hex
 * Automatically detects the format and returns the raw Ed25519 public key
 */
export const extractPublicKey = (keyHex: string): string => {
  // First, try to parse as COSE key (CBOR format)
  try {
    const keyBytes = Buffer.from(keyHex, 'hex')
    const decoded = decode(keyBytes)

    // Check if it's a Map (COSE key structure)
    if (decoded instanceof Map) {
      const publicKeyEntry = decoded.get(-2)
      if (publicKeyEntry) {
        // It's a COSE key, extract the public key
        const publicKeyBuffer = Buffer.from(publicKeyEntry as Uint8Array)
        return publicKeyBuffer.toString('hex')
      }
    }
  } catch {
    // Not a COSE key, continue to check if it's a raw public key
  }

  // If not COSE key, assume it's already a raw public key
  // Validate it's valid hex and has reasonable length (Ed25519 public key is 32 bytes = 64 hex chars)
  if (!isHexString(keyHex)) {
    throw new Error('Invalid key format: not valid hex')
  }

  const keyLength = Buffer.from(keyHex, 'hex').length
  if (keyLength !== 32) {
    throw new Error(
      `Invalid public key length: expected 32 bytes (64 hex chars), got ${keyLength} bytes`,
    )
  }

  return keyHex
}

/**
 * Extract public key from COSE_Sign1 protected header
 * The public key is stored at label 4 in the protected header map
 */
/**
 * Extract public key from COSE_Sign1 protected header (label 4)
 * Returns null if not found (some wallets don't include it)
 */
export const extractPublicKeyFromSignature = (
  protectedHeaderBytes: Uint8Array,
): string | null => {
  try {
    const protectedHeader = decode(Buffer.from(protectedHeaderBytes)) as Map<
      number | string,
      unknown
    >

    // Label 4 contains the public key (optional per CIP-8)
    const publicKeyEntry = protectedHeader.get(4)
    if (!publicKeyEntry) {
      return null
    }

    const publicKeyBuffer = Buffer.from(publicKeyEntry as Uint8Array)
    return publicKeyBuffer.toString('hex')
  } catch (error) {
    console.warn(
      'Failed to extract public key from signature:',
      error instanceof Error ? error.message : 'Unknown error',
    )
    return null
  }
}

/**
 * Extract address from COSE_Sign1 protected header and convert to bech32
 * The address is stored at label "address" in the protected header map as hex bytes
 */
export const extractAddressFromSignature = async (
  protectedHeaderBytes: Uint8Array,
): Promise<string | null> => {
  try {
    const {CardanoMobile} = await import('@yoroi/cardano-wallet')

    const protectedHeader = decode(Buffer.from(protectedHeaderBytes)) as Map<
      number | string,
      unknown
    >

    const addressEntry = protectedHeader.get('address')
    if (!addressEntry) {
      return null
    }

    const addressHex = Buffer.from(addressEntry as Uint8Array).toString('hex')

    // Convert hex address to bech32 for display
    try {
      const address = CardanoMobile.Address.fromHex(addressHex)
      if (address.isMalformed()) {
        console.warn(
          'Extracted address is malformed, returning hex:',
          addressHex,
        )
        return addressHex
      }
      const bech32 = address.toBech32(undefined)
      return bech32 || addressHex
    } catch (error) {
      console.warn('Failed to convert address to bech32:', error)
      return addressHex
    }
  } catch (error) {
    console.error('Failed to extract address from signature:', error)
    return null
  }
}

/**
 * Extract payload from COSE_Sign1 and convert to UTF-8 string
 */
export const extractPayloadFromSignature = (
  payloadBytes: Uint8Array | null,
): string | null => {
  if (!payloadBytes) {
    return null
  }

  try {
    const payloadBuffer = Buffer.from(payloadBytes)
    // Try to decode as UTF-8
    return payloadBuffer.toString('utf-8')
  } catch {
    return null
  }
}

/**
 * Verify that a public key corresponds to a given Cardano address
 * This checks if the address was derived from the public key
 */
export const verifyAddressFromPublicKey = async (
  publicKeyHex: string,
  addressBech32: string,
): Promise<boolean> => {
  try {
    const {CardanoMobile} = await import('@yoroi/cardano-wallet')

    // Parse the address
    const wasmAddress = CardanoMobile.Address.fromBech32(addressBech32)
    if (wasmAddress.isMalformed()) {
      return false
    }

    // Get the public key hash
    const publicKeyBuffer = Buffer.from(publicKeyHex, 'hex')
    const publicKey = CardanoMobile.PublicKey.fromBytes(publicKeyBuffer)
    const keyHash = publicKey.hash()
    const keyHashHex = keyHash.toHex()

    // Try to match different address types
    try {
      // Try BaseAddress (payment + stake)
      const baseAddr = CardanoMobile.BaseAddress.fromAddress(wasmAddress)
      if (baseAddr?.hasValue()) {
        const paymentCred = baseAddr.paymentCred()

        // Check if payment credential matches
        if (paymentCred.kind() === 0) {
          // Key hash credential
          const paymentKeyHash = paymentCred.toKeyhash()
          if (
            paymentKeyHash?.hasValue() &&
            paymentKeyHash.toHex() === keyHashHex
          ) {
            return true
          }
        }
      }
    } catch {
      // Not a base address, continue
    }

    try {
      // Try EnterpriseAddress (payment only)
      const enterpriseAddr =
        CardanoMobile.EnterpriseAddress.fromAddress(wasmAddress)
      if (enterpriseAddr?.hasValue()) {
        const paymentCred = enterpriseAddr.paymentCred()
        if (paymentCred.kind() === 0) {
          // Key hash credential
          const paymentKeyHash = paymentCred.toKeyhash()
          if (
            paymentKeyHash?.hasValue() &&
            paymentKeyHash.toHex() === keyHashHex
          ) {
            return true
          }
        }
      }
    } catch {
      // Not an enterprise address, continue
    }

    try {
      // Try RewardAddress (stake only)
      const rewardAddr = CardanoMobile.RewardAddress.fromAddress(wasmAddress)
      if (rewardAddr?.hasValue()) {
        const stakeCred = rewardAddr.paymentCred()
        if (stakeCred.kind() === 0) {
          // Key hash credential
          const stakeKeyHash = stakeCred.toKeyhash()
          if (stakeKeyHash?.hasValue() && stakeKeyHash.toHex() === keyHashHex) {
            return true
          }
        }
      }
    } catch {
      // Not a reward address
    }

    return false
  } catch (error) {
    console.error('Address verification error:', error)
    return false
  }
}

/**
 * Check if a string is valid hex
 */
export const isHexString = (str: string): boolean => {
  return /^[0-9a-fA-F]+$/.test(str)
}

/**
 * Check if a string is valid JSON
 */
export const isValidJson = (str: string): boolean => {
  try {
    JSON.parse(str)
    return true
  } catch {
    return false
  }
}

/**
 * Convert payload to hex based on format
 */
export const payloadToHex = (
  payload: string,
  format: 'text' | 'json' | 'hex',
): string => {
  if (format === 'hex') {
    if (!isHexString(payload)) {
      throw new Error('Invalid hex string')
    }
    return payload
  }

  if (format === 'json') {
    if (!isValidJson(payload)) {
      throw new Error('Invalid JSON string')
    }
    return Buffer.from(payload, 'utf-8').toString('hex')
  }

  // format === 'text'
  return Buffer.from(payload, 'utf-8').toString('hex')
}

/**
 * Get message length in bytes based on format
 */
export const getMessageLengthInBytes = (
  message: string,
  format: 'text' | 'json' | 'hex',
): number => {
  try {
    const hex = payloadToHex(message, format)
    return Buffer.from(hex, 'hex').length
  } catch {
    return Buffer.from(message, 'utf-8').length
  }
}
