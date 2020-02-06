// @flow
import {Bip32PublicKey} from 'react-native-chain-libs'

import jestSetup from '../../jestSetup'
import {createDelegationTx} from './delegationUtils'
import {getTxInputTotal, getTxOutputTotal} from './transactions/utils'
import {NUMBERS} from '../../config'

import type {AddressedUtxo} from '../../types/HistoryTransaction'
import type {PoolData} from './delegationUtils'

jestSetup.setup()

const sampleUtxos: Array<AddressedUtxo> = [
  {
    amount: '68332006',
    receiver:
      // eslint-disable-next-line
      '84f8162de231996ba0ce2ecc1c7fc60383b7c9024ca90a000041bd011c460e1d68b3f377c0915e440af99364c0fe23e68d96e15fd26461b2c8e9a268ed229f417f',
    tx_hash: '381f1885f2cfd66f45481ca75d114b7522b0bc4a0458b627df66a4cb55df7bc7',
    tx_index: 0,
    utxo_id:
      '381f1885f2cfd66f45481ca75d114b7522b0bc4a0458b627df66a4cb55df7bc70',
    addressing: {
      account: 0,
      change: 1,
      index: 0,
    },
  },
]

describe('create delegation transaction', () => {
  it('Should create a valid delegation transaction', async () => {
    const poolData: PoolData = {
      id: '31e6f9117efd3a1ae832d358d7cdd78dd713550a516da2ba7f257c562cb41804',
    }
    const accountKey = await Bip32PublicKey.from_bytes(
      Buffer.from(
        // eslint-disable-next-line max-len
        'a9247c6175fbbfe0ce11593584849fcc9e5adc17d54a05a820e9416afc199d0c12830a090361d98280ef9ffc120d8b8aa84fd22e57ef585300f60c92b4a166b8',
        'hex',
      ),
    )
    const stakingKey = await (await (await accountKey.derive(2)).derive(
      NUMBERS.STAKING_KEY_INDEX,
    )).to_raw_key()
    const delegationTxData = await createDelegationTx(
      poolData,
      0,
      sampleUtxos,
      stakingKey,
      {
        address:
          // eslint-disable-next-line
          '840c4f2fcc7ad16450970b99c0c7b84331aaccdb9afa5257fb6613b4a30fbced25b3f377c0915e440af99364c0fe23e68d96e15fd26461b2c8e9a268ed229f417f',
        addressing: {
          account: 0,
          change: 1,
          index: 1,
        },
      },
    )
    const inputSum = await getTxInputTotal(delegationTxData.unsignedTx.IOs)
    const outputSum = await getTxOutputTotal(delegationTxData.unsignedTx.IOs)
    expect(outputSum.toString()).toEqual('68176617')
    expect(inputSum.toString()).toEqual('68332006')
    expect(delegationTxData.totalAmountToDelegate.toString()).toEqual(
      '68176617',
    )
    expect(delegationTxData.unsignedTx.senderUtxos).toEqual([sampleUtxos[0]])
  })
})
