import {PrivateKey} from '@emurgo/cross-csl-core'
import {init} from '@emurgo/cross-msl-mobile'
import {Buffer} from 'buffer'

const MSL = init('cip8')

export const sign = async (address: Buffer, signKey: PrivateKey, payload: Buffer) => {
  const protectedHeader = await MSL.HeaderMap.new()
  await protectedHeader.setAlgorithmId(await MSL.Label.fromAlgorithmId(MSL.AlgorithmId.EdDSA))
  await protectedHeader.setHeader(await MSL.Label.newText('address'), await MSL.CBORValue.newBytes(address))
  const protectedSerialized = await MSL.ProtectedHeaderMap.new(protectedHeader)
  const unprotected = await MSL.HeaderMap.new()
  const headers = await MSL.Headers.new(protectedSerialized, unprotected)
  const builder = await MSL.COSESign1Builder.new(headers, payload, false)
  const toSign = await (await builder.makeDataToSign()).toBytes()
  const signedSigStruct = await (await signKey.sign(toSign)).toBytes()
  return builder.build(signedSigStruct)
}
