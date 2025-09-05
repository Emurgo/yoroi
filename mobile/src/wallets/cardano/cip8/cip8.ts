import {PrivateKey} from '@emurgo/cross-csl-core'
import {init} from '@emurgo/cross-msl-mobile'
import {Buffer} from 'buffer'

const MSL = init('cip8')

export const sign = async (
  address: Buffer,
  signKey: PrivateKey,
  payload: Buffer,
) => {
  const protectedHeader = MSL.HeaderMap.new()
  protectedHeader.setAlgorithmId(
    MSL.Label.fromAlgorithmId(MSL.AlgorithmId.EdDSA),
  )
  protectedHeader.setHeader(
    MSL.Label.newText('address'),
    MSL.CBORValue.newBytes(address),
  )
  const protectedSerialized = MSL.ProtectedHeaderMap.new(protectedHeader)
  const unprotected = MSL.HeaderMap.new()
  const headers = MSL.Headers.new(protectedSerialized, unprotected)
  const builder = MSL.COSESign1Builder.new(headers, payload, false)
  const toSign = builder.makeDataToSign().toBytes()
  const signedSigStruct = signKey.sign(toSign).toBytes()
  return builder.build(signedSigStruct)
}

export const makeCip8Key = async (publicSigningKey: Uint8Array) => {
  const key = MSL.COSEKey.new(MSL.Label.fromKeyType(MSL.KeyType.OKP))
  key.setAlgorithmId(MSL.Label.fromAlgorithmId(MSL.AlgorithmId.EdDSA))
  key.setHeader(
    MSL.Label.newInt(MSL.Int.newNegative(MSL.BigNum.fromStr('1'))),
    MSL.CBORValue.newInt(MSL.Int.newI32(6)),
  )
  key.setHeader(
    MSL.Label.newInt(MSL.Int.newNegative(MSL.BigNum.fromStr('2'))),
    MSL.CBORValue.newBytes(publicSigningKey),
  )

  return key
}

export const buildCoseSign1FromSignature = async (
  address: Buffer,
  signature: Buffer,
  payload: Buffer,
) => {
  const protectedHeader = MSL.HeaderMap.new()
  protectedHeader.setAlgorithmId(
    MSL.Label.fromAlgorithmId(MSL.AlgorithmId.EdDSA),
  )
  protectedHeader.setHeader(
    MSL.Label.newText('address'),
    MSL.CBORValue.newBytes(address),
  )
  const protectedSerialized = MSL.ProtectedHeaderMap.new(protectedHeader)
  const unprotected = MSL.HeaderMap.new()
  const headers = MSL.Headers.new(protectedSerialized, unprotected)
  const builder = MSL.COSESign1Builder.new(headers, payload, false)
  return builder.build(signature)
}
