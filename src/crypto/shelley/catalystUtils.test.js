// @flow
/* eslint-disable camelcase */
/* eslint-disable max-len */
import {
  BigNum,
  RewardAddress,
  PrivateKey,
  StakeCredential,
  NetworkInfo,
  MetadataJsonSchema,
  MetadataList,
  GeneralTransactionMetadata,
  decode_metadatum_to_json_str,
} from '@emurgo/react-native-haskell-shelley'

import jestSetup from '../../jestSetup'
import {
  CatalystLabels,
  generateRegistration,
  isRegistrationOpen,
} from './catalystUtils'

jestSetup.setup()

test('Generate Catalyst registration tx', async () => {
  const stakePrivateKey = await PrivateKey.from_normal_bytes(
    Buffer.from(
      'f5beaeff7932a4164d270afde7716067582412e8977e67986cd9b456fc082e3a',
      'hex',
    ),
  )
  const catalystPrivateKey = await PrivateKey.from_extended_bytes(
    Buffer.from(
      '4820f7ce221e177c8eae2b2ee5c1f1581a0d88ca5c14329d8f2389e77a465655c27662621bfb99cb9445bf8114cc2a630afd2dd53bc88c08c5f2aed8e9c7cb89',
      'hex',
    ),
  )

  // eslint-disable-next-line max-len
  // addr1qx0srp4ptag9j2e3rdtesrsxe708j80uhxv2r7utl4jaqm4rhf28yg7fkl6dd329cuxq7tqahhujtt5cmdmp9pa2t2zsp2vc6a (019f0186a15f50592b311b57980e06cf9e791dfcb998a1fb8bfd65d06ea3ba547223c9b7f4d6c545c70c0f2c1dbdf925ae98db761287aa5a85)
  const address = await RewardAddress.new(
    await NetworkInfo.testnet().network_id(),
    await StakeCredential.from_keyhash(
      await (await stakePrivateKey.to_public()).hash(),
    ),
  )

  const signer = async (hashedMetadata) => {
    return await (await stakePrivateKey.sign(hashedMetadata)).to_hex()
  }

  const nonce = 1234
  const txMetaData = await generateRegistration({
    stakePublicKey: await stakePrivateKey.to_public(),
    catalystPublicKey: await catalystPrivateKey.to_public(),
    rewardAddress: await address.to_address(),
    absSlotNumber: nonce,
    signer,
  })

  const result = await GeneralTransactionMetadata.from_bytes(
    await (await (await MetadataList.from_bytes(
      await txMetaData.to_bytes(),
    )).get(0)).to_bytes(),
  )

  const data = await result.get(
    await BigNum.from_str(CatalystLabels.DATA.toString()),
  )
  if (data == null) throw new Error('Should never happen')

  const sig = await result.get(
    await BigNum.from_str(CatalystLabels.SIG.toString()),
  )
  if (sig == null) throw new Error('Should never happen')

  const dataJson = await decode_metadatum_to_json_str(
    data,
    await MetadataJsonSchema.BasicConversions,
  )
  const sigJson = await decode_metadatum_to_json_str(
    sig,
    await MetadataJsonSchema.BasicConversions,
  )

  /* eslint-disable quote-props */
  const expectedResult = {
    '61284': {
      '1': '0x0036ef3e1f0d3f5989e2d155ea54bdb2a72c4c456ccb959af4c94868f473f5a0',
      '2': '0x86870efc99c453a873a16492ce87738ec79a0ebd064379a62e2c9cf4e119219e',
      '3': '0xe0ae3a0a7aeda4aea522e74e4fe36759fca80789a613a58a4364f6ecef',
      '4': nonce,
    },
    '61285': {
      '1':
        '0x6c2312cd49067ecf0920df7e067199c55b3faef4ec0bce1bd2cfb99793972478c45876af2bc271ac759c5ce40ace5a398b9fdb0e359f3c333fe856648804780e',
    },
  }
  expect({
    [CatalystLabels.DATA]: JSON.parse(dataJson),
    [CatalystLabels.SIG]: JSON.parse(sigJson),
  }).toEqual(expectedResult)
})

test('Check if catalyst registration is open', () => {
  const now = Date.now()
  const yesterday = now - 24 * 60 * 60 * 1000
  const yesterdayPlusAWeek = yesterday + 7 * 24 * 60 * 60 * 1000

  const fundInfo = {
    registrationStart: new Date(yesterday).toISOString(),
    registrationEnd: new Date(yesterdayPlusAWeek).toISOString(),
  }
  expect(isRegistrationOpen(fundInfo)).toBe(true)
})
