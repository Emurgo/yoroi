import {SwapOpenOrder, SwapCompletedOrder} from '@yoroi/types/lib/swap/order'
import {ModelsOrder, ModelsToken} from './dexhunter'
import {Balance} from '@yoroi/types'
import AssetFingerprint from '@emurgo/cip14-js'

export const transformersMaker = () => {
  const asYoroiOpenOrder = (order: ModelsOrder) => {
    /* Examples
[
    {
        "_id": "65323e8d11d0c9e2e3324ef0",
        "amount_in": 8.3,
        "token_id_in": "000000000000000000000000000000000000000000000000000000006c6f76656c616365",
        "token_id_out": "1d7f33bd23d85e1a25d87d86fac4f199c3197a2f7afeb662a0f34e1e776f726c646d6f62696c65746f6b656e",
        "dex": "MUESLISWAP",
        "pool_id": "000000000000000000000000000000000000000000000000000000006c6f76656c6163651d7f33bd23d85e1a25d87d86fac4f199c3197a2f7afeb662a0f34e1e776f726c646d6f62696c65746f6b656eMUESLISWAP",
        "user_address": "addr1qyqjzx3tq8k3urnh3ay4x75m8hl2z9xrnjxmpd94ejexdw66ur70njt65a48f77lapzp878ynhu8as8k9jmtxu8jmtjq69hnqg",
        "user_stake": "stake1u9dwpl8ee9a2w6n5l007s3qnlrjfm7r7crmzed4nwred4eqc3eq59",
        "status": "COMPLETED",
        "dexhunter_fee": 0,
        "plutus_data": "d8799fd8799fd8799fd8799f581c01211a2b01ed1e0e778f49537a9b3dfea114c39c8db0b4b5ccb266bbffd8799fd8799fd8799f581c5ae0fcf9c97aa76a74fbdfe84413f8e49df87ec0f62cb6b370f2dae4ffffffff581c1d7f33bd23d85e1a25d87d86fac4f199c3197a2f7afeb662a0f34e1e50776f726c646d6f62696c65746f6b656e40401a00e41edfd87a801a00286f90ffff",
        "tx_hash": "0e63a916278abf4789a0cabc12ea01ec94663d88763f720263739a1460140060",
        "tx_output_index": 0,
        "last_update": "2023-10-20T08:47:50Z",
        "submission_time": "2023-10-20T08:47:05Z",
        "expected_out_amount": 14.950111,
        "actual_out_amount": 15.754782,
        "update_tx_hash": "9381d237a3d96bb7c75474fa389f4cda1660f26c300ea9314a1f59cc5b448f79",
        "batcher_fee": 1.5,
        "deposit": 1.15,
        "is_dexhunter": false,
        "is_stop_loss": false,
        "stop_loss_chunks": 0
    },
    {
        "_id": "6537a1914a3444a66b7f0704",
        "amount_in": 1,
        "token_id_in": "000000000000000000000000000000000000000000000000000000006c6f76656c616365",
        "token_id_out": "f10b16b705ef9baac04ca79c0da011633c8c20356b6a42262a1691da4348454646",
        "dex": "SUNDAESWAP",
        "pool_id": "000000000000000000000000000000000000000000000000000000006c6f76656c616365f10b16b705ef9baac04ca79c0da011633c8c20356b6a42262a1691da4348454646SUNDAESWAP",
        "user_address": "addr1qyqjzx3tq8k3urnh3ay4x75m8hl2z9xrnjxmpd94ejexdw66ur70njt65a48f77lapzp878ynhu8as8k9jmtxu8jmtjq69hnqg",
        "user_stake": "stake1u9dwpl8ee9a2w6n5l007s3qnlrjfm7r7crmzed4nwred4eqc3eq59",
        "status": "COMPLETED",
        "dexhunter_fee": 0,
        "plutus_data": "d8799f4157d8799fd8799fd8799fd8799f581c01211a2b01ed1e0e778f49537a9b3dfea114c39c8db0b4b5ccb266bbffd8799fd8799fd8799f581c5ae0fcf9c97aa76a74fbdfe84413f8e49df87ec0f62cb6b370f2dae4ffffffffd87a80ffd87a80ff1a002625a0d8799fd879801a000f4240d8799f1a00016c6effffff",
        "tx_hash": "f598e7feb4597a29495b8a35509453152f3d1449b8f9f4b98d46fac421776232",
        "tx_output_index": 0,
        "last_update": "2023-10-24T10:51:07Z",
        "submission_time": "2023-10-24T10:50:56Z",
        "expected_out_amount": 93294,
        "actual_out_amount": 94237,
        "update_tx_hash": "d81018d57809b1ec38b97602dbd93b7c6f3e155266d356032316b433461f238b",
        "batcher_fee": 2.5,
        "deposit": 2,
        "is_dexhunter": false,
        "is_stop_loss": false,
        "stop_loss_chunks": 0
    }
]
    */
    // TODO: Transform for yoroi
    return order as unknown as SwapOpenOrder
  }

  // TODO: Probably should just use SwapOrder, api doesn't have different schema for open/completed
  const asYoroiCompletedOrder = (order: ModelsOrder) =>
    order as unknown as SwapCompletedOrder

  const asYoroiBalanceTokenInfo = (token: ModelsToken): Balance.TokenInfo => {
    /* Examples
    [
    {
        "token_id": "885742cd7e0dad321622b5d3ad186797bd50c44cbde8b48be1583fbd534b554c4c",
        "token_decimals": "0",
        "token_policy": "885742cd7e0dad321622b5d3ad186797bd50c44cbde8b48be1583fbd",
        "token_ascii": "SKULL",
        "is_verified": true,
        "icon": "",
        "supply": "",
        "ticker": "SKULL"
    },
    {
        "token_id": "8d7cc34c1a44ef419cf1560cbb84e7720ca6c03ab99f8745ab61d19d50414e4441",
        "token_decimals": "0",
        "token_policy": "8d7cc34c1a44ef419cf1560cbb84e7720ca6c03ab99f8745ab61d19d",
        "token_ascii": "PANDA Token",
        "is_verified": true,
        "icon": "",
        "supply": "",
        "ticker": "PANDA"
    },
  ]
  */

    const policyId = token.token_policy ?? ''
    const hexName = token.token_id?.slice(policyId.length) ?? ''

    const tokenInfo: Balance.TokenInfo = {
      id: `${policyId}.${hexName}`,
      group: policyId,
      fingerprint: asTokenFingerprint({
        policyId,
        assetNameHex: hexName,
      }),
      name: token.token_ascii ?? '',
      decimals: Number(token.token_decimals ?? '0'),
      description: '',
      image: token.icon,
      kind: 'ft',
      icon: token.icon,
      ticker: token.ticker ?? '',
      symbol: token.ticker ?? '',
      metadatas: {},
    }
    return tokenInfo
  }

  const asYoroiBalanceTokenInfos = (
    tokens: ModelsToken[],
  ): Balance.TokenInfo[] => {
    if (tokens.length === 0) return []
    // filters should go into manager, but since we strip out the status is here for now
    return tokens
      .filter((token) => token.is_verified)
      .map(asYoroiBalanceTokenInfo)
  }

  return {
    asYoroiOpenOrder,
    asYoroiCompletedOrder,
    asYoroiBalanceTokenInfos,
  }
}

export const asTokenFingerprint = ({
  policyId,
  assetNameHex = '',
}: {
  policyId: string
  assetNameHex: string | undefined
}) => {
  const assetFingerprint = AssetFingerprint.fromParts(
    Buffer.from(policyId, 'hex'),
    Buffer.from(assetNameHex, 'hex'),
  )
  return assetFingerprint.fingerprint()
}
