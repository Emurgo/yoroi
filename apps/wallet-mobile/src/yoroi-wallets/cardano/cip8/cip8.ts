import {PrivateKey} from '@emurgo/cross-csl-core'
import {init} from '@emurgo/cross-msl-mobile'
import {Buffer} from 'buffer'

const MSL = init('cip8')

export const sign = async (address: Buffer, signKey: PrivateKey, payload: Buffer) => {
  console.log('signing', address, signKey, payload)
  console.log('-----------------------------------')
  console.log('MSL', MSL)
  console.log('MSL.HeaderMap', MSL.HeaderMap)
  console.log('MSL.HeaderMap.new', MSL.HeaderMap.new)
  try {
    const h = await MSL.HeaderMap.new()
  } catch (e) {
    console.log('error', e)
  }
  const protectedHeader = await MSL.HeaderMap.new()
  console.log('protectedHeader', protectedHeader)
  await protectedHeader.setAlgorithmId(await MSL.Label.fromAlgorithmId(MSL.AlgorithmId.EdDSA))
  console.log('protectedHeader', protectedHeader)
  await protectedHeader.setHeader(await MSL.Label.newText('address'), await MSL.CBORValue.newBytes(address))
  console.log('protectedHeader', protectedHeader)
  const protectedSerialized = await MSL.ProtectedHeaderMap.new(protectedHeader)
  console.log('protectedSerialized', protectedSerialized)
  const unprotected = await MSL.HeaderMap.new()
  console.log('unprotected', unprotected)
  const headers = await MSL.Headers.new(protectedSerialized, unprotected)
  console.log('headers', headers)
  const builder = await MSL.COSESign1Builder.new(headers, payload, false)
  console.log('builder', builder)
  const toSign = await (await builder.makeDataToSign()).toBytes()
  console.log('toSign', toSign)
  const signedSigStruct = await (await signKey.sign(toSign)).toBytes()
  console.log('signed', signedSigStruct)
  return builder.build(signedSigStruct)
}
