import {PrivateKey} from '@emurgo/cross-csl-core'
// import {init} from '@emurgo/cross-msl-mobile' // Temporarily disabled due to Python compatibility issues
import {Buffer} from 'buffer'

// const MSL = init('cip8') // Temporarily disabled due to Python compatibility issues
const MSL = null // Placeholder - MSL functionality temporarily disabled

export const sign = async (
  address: Buffer,
  signKey: PrivateKey,
  payload: Buffer,
) => {
  // MSL functionality temporarily disabled due to Python compatibility issues
  throw new Error(
    'MSL signing functionality is temporarily disabled due to Python compatibility issues',
  )

  // Original implementation (commented out):
  // const protectedHeader = await MSL.HeaderMap.new()
  // await protectedHeader.setAlgorithmId(
  //   await MSL.Label.fromAlgorithmId(MSL.AlgorithmId.EdDSA),
  // )
  // await protectedHeader.setHeader(
  //   await MSL.Label.newText('address'),
  //   await MSL.CBORValue.newBytes(address),
  // )
  // const protectedSerialized = await MSL.ProtectedHeaderMap.new(protectedHeader)
  // const unprotected = await MSL.HeaderMap.new()
  // const headers = await MSL.Headers.new(protectedSerialized, unprotected)
  // const builder = await MSL.COSESign1Builder.new(headers, payload, false)
  // const toSign = await (await builder.makeDataToSign()).toBytes()
  // const signedSigStruct = await (await signKey.sign(toSign)).toBytes()
  // return builder.build(signedSigStruct)
}

export const makeCip8Key = async (publicSigningKey: Uint8Array) => {
  // MSL functionality temporarily disabled due to Python compatibility issues
  throw new Error(
    'MSL key generation functionality is temporarily disabled due to Python compatibility issues',
  )

  // Original implementation (commented out):
  // const key = await MSL.COSEKey.new(
  //   await MSL.Label.fromKeyType(MSL.KeyType.OKP),
  // )
  // await key.setAlgorithmId(
  //   await MSL.Label.fromAlgorithmId(MSL.AlgorithmId.EdDSA),
  // )
  // await key.setHeader(
  //   await MSL.Label.newInt(
  //     await MSL.Int.newNegative(await MSL.BigNum.fromStr('1')),
  //   ),
  //   await MSL.CBORValue.newInt(await MSL.Int.newI32(6)),
  // )
  // await key.setHeader(
  //   await MSL.Label.newInt(
  //     await MSL.Int.newNegative(await MSL.BigNum.fromStr('2')),
  //   ),
  //   await MSL.CBORValue.newBytes(publicSigningKey),
  // )

  // return key
}

export const buildCoseSign1FromSignature = async (
  address: Buffer,
  signature: Buffer,
  payload: Buffer,
) => {
  // MSL functionality temporarily disabled due to Python compatibility issues
  throw new Error(
    'MSL signature building functionality is temporarily disabled due to Python compatibility issues',
  )

  // Original implementation (commented out):
  // const protectedHeader = await MSL.HeaderMap.new()
  // await protectedHeader.setAlgorithmId(
  //   await MSL.Label.fromAlgorithmId(MSL.AlgorithmId.EdDSA),
  // )
  // await protectedHeader.setHeader(
  //   await MSL.Label.newText('address'),
  //   await MSL.CBORValue.newBytes(address),
  // )
  // const protectedSerialized = await MSL.ProtectedHeaderMap.new(protectedHeader)
  // const unprotected = await MSL.HeaderMap.new()
  // const headers = await MSL.Headers.new(protectedSerialized, unprotected)
  // const builder = await MSL.COSESign1Builder.new(headers, payload, false)
  // return builder.build(signature)
}
