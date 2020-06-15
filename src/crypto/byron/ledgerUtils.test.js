// @flow
import jestSetup from '../../jestSetup'

import {createLedgerSignTxPayload} from './ledgerUtils'
import {signTransaction} from './util'
import {getTxsBodiesForUTXOs} from '../../api/api'

jestSetup.setup()

describe('prepare HW tx', () => {
  const walletData = require('./__fixtures/fake_wallet.json')
  const inputs = [
    {
      ptr: {
        id: 'e360c88cbbbad25db19a08c1278f0fc63416d668f5d5e7b17961ea716c103c14',
        index: 0,
      },
      value: {
        address: 'Ae2tdPwUPEZHvQHe6x1roq1J9DTAKY5v8XLYGFg7UrjopY8wEBNyiiiULY1',
        value: '4330556', // real value
      },
      addressing: {account: 0, change: 0, index: 0},
    },
    {
      ptr: {
        // same id as above, different index
        id: 'e360c88cbbbad25db19a08c1278f0fc63416d668f5d5e7b17961ea716c103c14',
        index: 1,
      },
      value: {
        address: 'Ae2tdPwUPEZJcamJUVWxJEwR8rj5x74t3FkUFDzKEdoL8YSyeRdwmJCW9c3',
        value: '22222',
      },
      addressing: {account: 0, change: 0, index: 1},
    },
    {
      ptr: {
        id: '33379b40e10850088484287a07756c5336b8675b33e28a42f02c344971de2d98',
        index: 0,
      },
      value: {
        address: 'Ae2tdPwUPEZAghGCdQykbGxc991wdoA8bXmSn7eCGuUKXF4EsRhWj4PJitn',
        // value: '4162695', // real
        value: '1111111',
      },
      addressing: {account: 0, change: 0, index: 1},
    },
  ]
  const outputAddress =
    'Ae2tdPwUPEZAghGCdQykbGxc991wdoA8bXmSn7eCGuUKXF4EsRhWj4PJitn'
  const change = 'Ae2tdPwUPEZJcamJUVWxJEwR8rj5x74t3FkUFDzKEdoL8YSyeRdwmJCW9c3'
  const addressedChange = {
    address: change,
    addressing: {account: 0, change: 1, index: 0},
  }

  it('can create payload to sign with ledger', async () => {
    expect.assertions(5)

    const outputs = [
      {
        address: outputAddress,
        value: '100',
      },
    ]

    const unsignedTx = await signTransaction(
      walletData,
      inputs,
      outputs,
      change,
    )
    const unsignedTxData = {
      inputs,
      outputs,
      changeAddress: change,
      fee: unsignedTx.fee,
    }

    const txsHashes = [...new Set(inputs.map((x) => x.ptr.id))]
    const txsBodiesMap = await getTxsBodiesForUTXOs({txsHashes})
    expect(txsBodiesMap).toHaveProperty(inputs[0].ptr.id)

    const {ledgerSignTxPayload} = await createLedgerSignTxPayload(
      unsignedTxData,
      txsBodiesMap,
      addressedChange,
    )
    expect(ledgerSignTxPayload.inputs).not.toBeNull()
    expect(ledgerSignTxPayload.outputs).not.toBeNull()
    // should only use first input
    expect(ledgerSignTxPayload.inputs[0].txDataHex).toBe(
      txsBodiesMap[inputs[0].ptr.id],
    )
    expect(ledgerSignTxPayload.inputs.length).toBe(1)
  })
})
