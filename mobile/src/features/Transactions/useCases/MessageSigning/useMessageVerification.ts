import {CardanoMobileWrapped} from '@yoroi/cardano-wallet'

import {Buffer} from 'buffer'
import {decode, encode} from 'cbor2'
import * as React from 'react'

import {
  extractAddressFromSignature,
  extractPayloadFromSignature,
  extractPublicKey,
  extractPublicKeyFromSignature,
  payloadToHex,
  verifyAddressFromPublicKey,
} from './utils'

export type VerificationResult = {
  isValid: boolean
  extractedMessage?: string
  extractedAddress?: string
  extractedPublicKey?: string
  addressMatches?: boolean
}

export const useMessageVerification = () => {
  const verifyMessage = React.useCallback(
    async (
      signatureHex: string,
      expectedPayload?: string,
      payloadFormat?: 'text' | 'json' | 'hex',
      expectedAddress?: string,
      keyHex?: string,
    ): Promise<VerificationResult> => {
      try {
        // Parse COSE_Sign1 from signature (CBOR array: [protected, unprotected, payload, signature])
        const signatureBuffer = Buffer.from(signatureHex, 'hex')

        const coseSign1Array = decode(signatureBuffer) as [
          Uint8Array, // protected header (CBOR-encoded bytes)
          Map<unknown, unknown>, // unprotected header
          Uint8Array | null, // payload
          Uint8Array, // signature
        ]

        if (!Array.isArray(coseSign1Array) || coseSign1Array.length !== 4) {
          throw new Error('Invalid COSE_Sign1 structure')
        }

        const [protectedHeaderBytes, , cosePayload, signatureBytes] =
          coseSign1Array

        // Extract public key from signature protected header (label 4)
        // Note: Some wallets don't include the public key in the signature (it's optional per CIP-8)
        let publicKeyHex = extractPublicKeyFromSignature(protectedHeaderBytes)
        const publicKeyFromSignature = publicKeyHex !== null

        // If public key not in signature, try to use provided key
        if (!publicKeyHex) {
          if (keyHex) {
            publicKeyHex = extractPublicKey(keyHex)
          } else {
            const extractedMessage = extractPayloadFromSignature(cosePayload)
            const extractedAddressBech32 =
              await extractAddressFromSignature(protectedHeaderBytes)
            return {
              isValid: false,
              extractedMessage: extractedMessage || undefined,
              extractedAddress: extractedAddressBech32 || undefined,
            }
          }
        }

        const publicKeyBuffer = Buffer.from(publicKeyHex, 'hex')

        // Extract address from signature protected header (if present)
        const extractedAddressBech32 =
          await extractAddressFromSignature(protectedHeaderBytes)

        // Extract original message from payload
        const extractedMessage = extractPayloadFromSignature(cosePayload)

        // If expected payload is provided, verify it matches
        if (expectedPayload && payloadFormat) {
          const expectedPayloadHex = payloadToHex(
            expectedPayload,
            payloadFormat,
          )
          const expectedPayloadBuffer = Buffer.from(expectedPayloadHex, 'hex')

          if (
            !cosePayload ||
            Buffer.from(cosePayload).compare(expectedPayloadBuffer) !== 0
          ) {
            return {
              isValid: false,
              extractedMessage: extractedMessage || undefined,
              extractedAddress: extractedAddressBech32 || undefined,
              extractedPublicKey: publicKeyHex,
            }
          }
        }

        // If key is provided and we have a public key from signature, verify they match
        // (If public key wasn't in signature, we already used the provided key above)
        if (keyHex && publicKeyFromSignature) {
          const providedPublicKeyHex = extractPublicKey(keyHex)
          if (providedPublicKeyHex !== publicKeyHex) {
            return {
              isValid: false,
              extractedMessage: extractedMessage || undefined,
              extractedAddress: extractedAddressBech32 || undefined,
              extractedPublicKey: publicKeyHex,
            }
          }
        }

        // Reconstruct the signature structure: ["Signature1", protected, external_aad, payload]
        // NOTE: protectedHeaderBytes is already the CBOR-encoded bytes (bstr) from COSE_Sign1
        const externalAad = Buffer.alloc(0) // Empty as per CIP-8
        const payloadBuffer = cosePayload
          ? Buffer.from(cosePayload)
          : Buffer.alloc(0)

        // Convert to Uint8Array - cbor2.encode() handles Uint8Array as byte strings correctly
        // Buffer objects get encoded as {type: 'Buffer', data: [...]} which is wrong
        const protectedHeaderUint8 = new Uint8Array(protectedHeaderBytes)
        const externalAadUint8 = new Uint8Array(externalAad)
        const payloadUint8 = new Uint8Array(payloadBuffer)

        // Sig_structure: ["Signature1", protected_header_bytes, external_aad, payload]
        // protected_header_bytes must be the raw CBOR-encoded bytes (bstr) from COSE_Sign1
        // Use Uint8Array so cbor2.encode() treats them as byte strings, not objects
        const sigStructure = [
          'Signature1',
          protectedHeaderUint8, // cbor2 encodes Uint8Array as byte string (bstr)
          externalAadUint8,
          payloadUint8,
        ]

        // Encode signature structure to CBOR
        const dataToSign = Buffer.from(encode(sigStructure))

        // Verify using CSL
        const isValid = CardanoMobileWrapped.cslScope((csl) => {
          const publicKey = csl.PublicKey.fromBytes(publicKeyBuffer)
          const signature = csl.Ed25519Signature.fromBytes(
            Buffer.from(signatureBytes),
          )

          return publicKey.verify(dataToSign, signature)
        })

        // Verify address if provided
        let addressMatches: boolean | undefined
        if (expectedAddress && isValid) {
          addressMatches = await verifyAddressFromPublicKey(
            publicKeyHex,
            expectedAddress,
          )
          // If address verification fails, mark as invalid
          if (!addressMatches) {
            return {
              isValid: false,
              extractedMessage: extractedMessage || undefined,
              extractedAddress: extractedAddressBech32 || undefined,
              extractedPublicKey: publicKeyHex,
              addressMatches: false,
            }
          }
        }

        return {
          isValid,
          extractedMessage: extractedMessage || undefined,
          extractedAddress: extractedAddressBech32 || undefined,
          extractedPublicKey: publicKeyHex,
          addressMatches,
        }
      } catch (error) {
        return {
          isValid: false,
        }
      }
    },
    [],
  )

  return {verifyMessage}
}
