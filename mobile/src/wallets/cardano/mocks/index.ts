import {BackendConfig, TipStatusResponse} from '@yoroi/api'
import {primaryTokenId} from '@yoroi/portfolio'
import {RemoteCertificateMeta} from '@yoroi/staking'
import {
  Address,
  Amount,
  AssetName,
  BlockHash,
  Branded,
  PolicyId,
  TokenId,
  TransactionHash,
  TransactionStatus,
  TxMetadata,
  UtxoId,
  WalletTransaction,
} from '@yoroi/types'

/**
 * Helper to create a mock WalletTransaction without individual field casts
 * This allows writing mock data naturally while ensuring proper branding
 */
function createMockWalletTransaction(data: {
  id: string
  type?: 'byron' | 'shelley'
  fee?: string
  status: string
  inputs: Array<{
    address: string
    amount: string
    assets?: Array<{
      amount: string
      tokenId: string | TokenId // Allow TokenId for primaryTokenId
      policyId: string
      name: string
    }>
    id?: string
  }>
  outputs: Array<{
    address: string
    amount: string
    assets?: Array<{
      amount: string
      tokenId: string | TokenId // Allow TokenId for primaryTokenId
      policyId: string
      name: string
    }>
  }>
  lastUpdatedAt: string
  submittedAt?: string | null
  blockNum?: number | null
  blockHash?: string | null
  txOrdinal?: number | null
  epoch?: number | null
  slot?: number | null
  withdrawals?: Array<{address: string; amount: string}>
  certificates?: Array<RemoteCertificateMeta>
  validContract?: boolean
  scriptSize?: number
  collateralInputs?: Array<{
    address: string
    amount: string
    assets?: Array<{
      amount: string
      tokenId: string | TokenId // Allow TokenId for primaryTokenId
      policyId: string
      name: string
    }>
  }>
  memo?: string | null
  metadata?: TxMetadata
}): WalletTransaction {
  return {
    id: data.id as TransactionHash,
    type: data.type,
    fee: data.fee ? (data.fee as Amount) : undefined,
    status: data.status as TransactionStatus,
    inputs: data.inputs.map((input) => ({
      address: input.address as Address,
      amount: input.amount as Amount,
      assets: (input.assets ?? []).map((asset) => ({
        amount: asset.amount as Amount,
        tokenId: (typeof asset.tokenId === 'string'
          ? asset.tokenId
          : asset.tokenId) as TokenId,
        policyId: asset.policyId as PolicyId,
        name: asset.name as AssetName,
      })),
      id: input.id ? (input.id as TransactionHash) : undefined,
    })),
    outputs: data.outputs.map((output) => ({
      address: output.address as Address,
      amount: output.amount as Amount,
      assets: (output.assets ?? []).map((asset) => ({
        amount: asset.amount as Amount,
        tokenId: asset.tokenId as TokenId,
        policyId: asset.policyId as PolicyId,
        name: asset.name as AssetName,
      })),
    })),
    lastUpdatedAt: data.lastUpdatedAt,
    submittedAt: data.submittedAt ?? null,
    blockNum: data.blockNum ?? null,
    blockHash: data.blockHash ? (data.blockHash as BlockHash) : null,
    txOrdinal: data.txOrdinal ?? null,
    epoch:
      data.epoch !== undefined && data.epoch !== null
        ? Branded.asEpochNumber(data.epoch)
        : null,
    slot:
      data.slot !== undefined && data.slot !== null
        ? Branded.asSlotNumber(data.slot)
        : null,
    withdrawals: (data.withdrawals ?? []).map((w) => ({
      address: w.address as Address,
      amount: w.amount as Amount,
    })),
    certificates: data.certificates ?? [],
    validContract: data.validContract,
    scriptSize: data.scriptSize,
    collateralInputs: (data.collateralInputs ?? []).map((input) => ({
      address: input.address as Address,
      amount: input.amount as Amount,
      assets: (input.assets ?? []).map((asset) => ({
        amount: asset.amount as Amount,
        tokenId: (typeof asset.tokenId === 'string'
          ? asset.tokenId
          : asset.tokenId) as TokenId,
        policyId: asset.policyId as PolicyId,
        name: asset.name as AssetName,
      })),
    })),
    memo: data.memo ?? null,
    metadata: data.metadata as TxMetadata | undefined,
  }
}

/**
 * Helper to convert mock RawTransaction format to WalletTransaction format
 */
function convertMockTx(tx: any): WalletTransaction {
  return {
    id: tx.hash as TransactionHash,
    type: tx.type,
    fee: tx.fee as Amount | undefined,
    status: (tx.tx_state || tx.status) as TransactionStatus,
    inputs: (tx.inputs || []).map((input: any) => ({
      id: input.id as UtxoId | undefined,
      address: input.address as Address,
      amount: input.amount as Amount,
      assets: (input.assets || []).map((asset: any) => ({
        amount: asset.amount as Amount,
        tokenId: asset.tokenId as TokenId,
        policyId: asset.policyId as PolicyId,
        name: asset.name as AssetName,
      })),
    })),
    outputs: (tx.outputs || []).map((output: any) => ({
      address: output.address as Address,
      amount: output.amount as Amount,
      assets: (output.assets || []).map((asset: any) => ({
        amount: asset.amount as Amount,
        tokenId: asset.tokenId as TokenId,
        policyId: asset.policyId as PolicyId,
        name: asset.name as AssetName,
      })),
    })),
    lastUpdatedAt: tx.last_update || tx.lastUpdatedAt,
    submittedAt: tx.time ?? tx.submittedAt ?? null,
    blockNum: tx.block_num ?? tx.blockNum ?? null,
    blockHash: (tx.block_hash ?? tx.blockHash ?? null) as BlockHash | null,
    txOrdinal: tx.tx_ordinal ?? tx.txOrdinal ?? null,
    epoch: tx.epoch ?? null,
    slot: tx.slot ?? null,
    withdrawals: tx.withdrawals || [],
    certificates: tx.certificates || [],
    validContract: tx.valid_contract ?? tx.validContract,
    scriptSize: tx.script_size ?? tx.scriptSize,
    collateralInputs: (tx.collateral_inputs || tx.collateralInputs || []).map(
      (input: any) => ({
        address: input.address as Address,
        amount: input.amount as Amount,
        assets: (input.assets || []).map((asset: any) => ({
          amount: asset.amount as Amount,
          tokenId: asset.tokenId as TokenId,
          policyId: asset.policyId as PolicyId,
          name: asset.name as AssetName,
        })),
      }),
    ),
    memo: null,
    metadata: tx.metadata,
  }
}

export const mockedBackendConfig: BackendConfig = {
  API_ROOT: 'https://fakeapiroot.com',
  TOKEN_INFO_SERVICE: 'https://faketokeninfoservice.com',
  NFT_STORAGE_URL: 'https://fakenftstorageurl.com',
  FETCH_UTXOS_MAX_ADDRESSES: 2,
  TX_HISTORY_MAX_ADDRESSES: 2,
  FILTER_USED_MAX_ADDRESSES: 2,
  TX_HISTORY_RESPONSE_LIMIT: 2,
}

export const mockTx: WalletTransaction = {
  id: '0a8962dde362eef1f840defe6f916fdf9701ad53c7cb5dd4a74ab85df8e9bffc' as TransactionHash,
  type: 'shelley',
  fee: '179537' as Amount,
  status: 'Successful',
  inputs: [
    {
      address:
        'addr_test1qrrdv3uxj8shu27ea9djvnn3rl4w3lvh3cyck6yc36mvf6ctlqxj9g0azvpycncr9u600p6t556qhc3psk06uzzw6saq4kvdpq' as Address,
      amount: '967141533' as Amount,
      assets: [
        {
          amount: '1' as Amount,
          tokenId:
            '57e37bc9a9c0a099a6636c3deb93b82e7edec8a9a40883017bae2674.717171717171' as TokenId,
          policyId:
            '57e37bc9a9c0a099a6636c3deb93b82e7edec8a9a40883017bae2674' as PolicyId as PolicyId,
          name: '717171717171' as AssetName as AssetName,
        },
        {
          amount: '1' as Amount,
          tokenId:
            'fc53320cfda5add9cde1e7094c73596eacc26dbe79834b67c14b5dad.656565656565' as TokenId,
          policyId:
            'fc53320cfda5add9cde1e7094c73596eacc26dbe79834b67c14b5dad' as PolicyId as PolicyId,
          name: '656565656565' as AssetName as AssetName,
        },
      ],
    },
    {
      address:
        'addr_test1qqgxd3r59psq0dg33t7asmvjmtu55tvvcmeq5kmhj0tmqjctlqxj9g0azvpycncr9u600p6t556qhc3psk06uzzw6saqk4x7z6' as Address,
      amount: '2000000' as Amount,
      assets: [
        {
          amount: '1' as Amount,
          tokenId:
            '0b71c073fcf017eeff0664070c790a2bcc47077566904be471c46c13.727272727272' as TokenId,
          policyId:
            '0b71c073fcf017eeff0664070c790a2bcc47077566904be471c46c13' as PolicyId as PolicyId,
          name: '727272727272' as AssetName as AssetName,
        },
      ],
    },
  ],
  outputs: [
    {
      address:
        'addr_test1qrxlnftwl73taxvcapnhgctae895l582a6r7k7jjeuwvzp0rvvww4m29k4km54utxag3mlhdsr73m62rsae6ad3hj6kqcexkh8' as Address,
      amount: '7305977' as Amount,
      assets: [],
    },
    {
      address:
        'addr_test1qrqzse20fh7mmt5k9xf4sug3a2lh5fa7x9nr98avp0ac78stlqxj9g0azvpycncr9u600p6t556qhc3psk06uzzw6saq6xr7ra' as Address,
      amount: '961656019' as Amount,
      assets: [
        {
          amount: '1' as Amount,
          tokenId:
            '0b71c073fcf017eeff0664070c790a2bcc47077566904be471c46c13.727272727272' as TokenId,
          policyId:
            '0b71c073fcf017eeff0664070c790a2bcc47077566904be471c46c13' as PolicyId,
          name: '727272727272' as AssetName,
        },
        {
          amount: '1' as Amount,
          tokenId:
            '57e37bc9a9c0a099a6636c3deb93b82e7edec8a9a40883017bae2674.717171717171' as TokenId,
          policyId:
            '57e37bc9a9c0a099a6636c3deb93b82e7edec8a9a40883017bae2674' as PolicyId,
          name: '717171717171' as AssetName,
        },
        {
          amount: '1' as Amount,
          tokenId:
            'fc53320cfda5add9cde1e7094c73596eacc26dbe79834b67c14b5dad.656565656565' as TokenId,
          policyId:
            'fc53320cfda5add9cde1e7094c73596eacc26dbe79834b67c14b5dad' as PolicyId,
          name: '656565656565' as AssetName,
        },
      ],
    },
  ],
  lastUpdatedAt: '2021-09-13T18:42:10.000Z',
  submittedAt: '2021-09-13T18:42:10.000Z',
  blockNum: 2909238,
  blockHash:
    'fb418acaa29c66e799a16b594f7beedfe2ef53413e9863b61a418f2df1ff1442' as BlockHash as BlockHash,
  txOrdinal: 0,
  epoch: Branded.asEpochNumber(156),
  slot: Branded.asSlotNumber(166914),
  withdrawals: [],
  certificates: [
    {
      kind: 'StakeDeregistration',
      rewardAddress:
        'e0acab7e493ece4c1e6ae627ef9f5f7c9b1063e599e4aa91f87f0d58ae',
    },
  ],
  validContract: true,
  scriptSize: 0,
  collateralInputs: [],
  memo: null,
}

export const mockedAddressesByChunks = [
  [
    'addr_test1qqkv3gr95tsuvwmgy4fcyffpcaxta9xu3df3az4rydxtlmwv60x7wwxgjxt6865rgds3na6sezwl4j483vmm796z0f7s9c9pry',
    'addr_test1qz7lg9vs0yd2dwmxmc5fwwzf0x85zyeg0ssvpnvw92a73f9v4dlyj0kwfs0x4e38a7047lymzp37tx0y42glslcdtzhqhfm3hv',
  ],
  [
    'addr_test1qqlywk65k52hryugsamjy8ch63kw58sfry4jv8pq57fcapdv4dlyj0kwfs0x4e38a7047lymzp37tx0y42glslcdtzhqmascap',
  ],
  ['stake_test18pq57fcj0kwfs0x4e38tzhqm'],
]

export const mockedHistoryResponse: {
  isLast: boolean
  transactions: Array<WalletTransaction>
} = {
  isLast: true,
  transactions: [
    convertMockTx({
      hash: '54ab3dc8e717040b9b4c523d0756cfc59a30f107e053b4cd474e11e818be0ddg',
      fee: '207301',
      valid_contract: true,
      script_size: 0,
      type: 'shelley',
      withdrawals: [],
      certificates: [
        {
          kind: 'StakeRegistration',
          rewardAddress:
            'e0acab7e493ece4c1e6ae627ef9f5f7c9b1063e599e4aa91f87f0d58ae',
        },
        {
          kind: 'StakeDelegation',
          poolKeyHash:
            '8a77ce4ffc0c690419675aa5396df9a38c9cd20e36483d2d2465ce86',
          rewardAddress:
            'e0acab7e493ece4c1e6ae627ef9f5f7c9b1063e599e4aa91f87f0d58ae',
        },
      ],
      tx_ordinal: 6,
      tx_state: 'Successful',
      last_update: '2022-06-12T23:46:47.000Z',
      block_num: 3626416,
      block_hash:
        '3be6615c2711f8c85e5777d1a060682bba507551d99d3568569fe8dfb7dcc690' as TransactionHash,
      time: '2022-06-12T23:46:47.000Z',
      epoch: Branded.asEpochNumber(210),
      slot: Branded.asSlotNumber(357991),
      inputs: [
        {
          address:
            'addr_test1qz7lg9vs0yd2dwmxmc5fwwzf0x85zyeg0ssvpnvw92a73f9v4dlyj0kwfs0x4e38a7047lymzp37tx0y42glslcdtzhqhfm3hv' as Address,
          amount: '972614426' as Amount,
          id: '7bbdb2c383b2a87d6b6e596af4784c0460837018b795597cb5f284ea74d967161',
          index: 1,
          txHash:
            '7bbdb2c383b2a87d6b6e596af4784c0460837018b795597cb5f284ea74d96716' as TransactionHash,
          assets: [
            {
              tokenId:
                '08d91ec4e6c743a92de97d2fde5ca0d81493555c535894a3097061f7.c8b0' as TokenId,
              policyId:
                '08d91ec4e6c743a92de97d2fde5ca0d81493555c535894a3097061f7' as PolicyId,
              name: 'c8b0' as AssetName,
              amount: '148' as Amount,
            },
            {
              tokenId:
                '0a31cbe14cab7ce93b35cda636bd99ca77130c5ba44cb745af550c68.4e46543135' as TokenId,
              policyId:
                '0a31cbe14cab7ce93b35cda636bd99ca77130c5ba44cb745af550c68' as PolicyId,
              name: '4e46543135' as AssetName,
              amount: '1' as Amount,
            },
            {
              tokenId:
                '1ca1fc0c880d25850cb00303788dfb51bdf2f902f6dce47d1ad09d5b.44' as TokenId,
              policyId:
                '1ca1fc0c880d25850cb00303788dfb51bdf2f902f6dce47d1ad09d5b' as PolicyId,
              name: '44' as AssetName,
              amount: '2463889379' as Amount,
            },
            {
              tokenId:
                '1d129dc9c03f95a863489883914f05a52e13135994a32f0cbeacc65f.74484f444c52' as TokenId,
              policyId:
                '1d129dc9c03f95a863489883914f05a52e13135994a32f0cbeacc65f' as PolicyId,
              name: '74484f444c52' as AssetName,
              amount: '5' as Amount,
            },
            {
              tokenId:
                '29d222ce763455e3d7a09a665ce554f00ac89d2e99a1a83d267170c6.4d494e' as TokenId,
              policyId:
                '29d222ce763455e3d7a09a665ce554f00ac89d2e99a1a83d267170c6' as PolicyId,
              name: '4d494e' as AssetName,
              amount: '215410' as Amount,
            },
            {
              tokenId:
                '29d222ce763455e3d7a09a665ce554f00ac89d2e99a1a83d267170c6.4d494e74' as TokenId,
              policyId:
                '29d222ce763455e3d7a09a665ce554f00ac89d2e99a1a83d267170c6' as PolicyId,
              name: '4d494e74' as AssetName,
              amount: '179' as Amount,
            },
            {
              tokenId:
                '3eb82f197734954a140faa953203e2454421832c4b00aff63a62459d.53544b' as TokenId,
              policyId:
                '3eb82f197734954a140faa953203e2454421832c4b00aff63a62459d' as PolicyId,
              name: '53544b' as AssetName,
              amount: '93' as Amount,
            },
            {
              tokenId:
                '57575a1b17e61ade154b325dceca4c3cfe26b6f98f9b186d08583ada.66697368546f6b656e' as TokenId,
              policyId:
                '57575a1b17e61ade154b325dceca4c3cfe26b6f98f9b186d08583ada' as PolicyId,
              name: '66697368546f6b656e' as AssetName,
              amount: '133' as Amount,
            },
            {
              tokenId:
                '57fca08abbaddee36da742a839f7d83a7e1d2419f1507fcbf3916522.4d494e54' as TokenId,
              policyId:
                '57fca08abbaddee36da742a839f7d83a7e1d2419f1507fcbf3916522' as PolicyId,
              name: '4d494e54' as AssetName,
              amount: '10840562' as Amount,
            },
            {
              tokenId:
                '57fca08abbaddee36da742a839f7d83a7e1d2419f1507fcbf3916522.534245525259' as TokenId,
              policyId:
                '57fca08abbaddee36da742a839f7d83a7e1d2419f1507fcbf3916522' as PolicyId,
              name: '534245525259' as AssetName,
              amount: '3422266' as Amount,
            },
            {
              tokenId:
                '698a6ea0ca99f315034072af31eaac6ec11fe8558d3f48e9775aab9d.7444524950' as TokenId,
              policyId:
                '698a6ea0ca99f315034072af31eaac6ec11fe8558d3f48e9775aab9d' as PolicyId,
              name: '7444524950' as AssetName,
              amount: '838202298' as Amount,
            },
            {
              tokenId: primaryTokenId,
              policyId:
                '6b8d07d69639e9413dd637a1a815a7323c69c86abbafb66dbfdb1aa7' as PolicyId,
              name: '' as AssetName,
              amount: '3' as Amount,
            },
            {
              tokenId:
                '7312879acbb97007b89619c711749d4bbc51e365682daaa4f18d0759.4d696c6b6f6d656461466f6f626172' as TokenId,
              policyId:
                '7312879acbb97007b89619c711749d4bbc51e365682daaa4f18d0759' as PolicyId,
              name: '4d696c6b6f6d656461466f6f626172' as AssetName,
              amount: '4999009' as Amount,
            },
            {
              tokenId:
                '8c4662efcb7fd069c9e4003192b430e9e153e5c3e11099e3dab29772.4d4152454b' as TokenId,
              policyId:
                '8c4662efcb7fd069c9e4003192b430e9e153e5c3e11099e3dab29772' as PolicyId,
              name: '4d4152454b' as AssetName,
              amount: '633' as Amount,
            },
            {
              tokenId:
                '9e5f43a9e77e4ba2e5c5db37daee3ee0a78bc87cdea3c34f7f78523c.546f6b656e3131' as TokenId,
              policyId:
                '9e5f43a9e77e4ba2e5c5db37daee3ee0a78bc87cdea3c34f7f78523c' as PolicyId,
              name: '546f6b656e3131' as AssetName,
              amount: '1' as Amount,
            },
            {
              tokenId:
                'c85f714f2187021c7bab53741f659d0c5b1a6e7529d32b7794ff051c.474f4c44' as TokenId,
              policyId:
                'c85f714f2187021c7bab53741f659d0c5b1a6e7529d32b7794ff051c' as PolicyId,
              name: '474f4c44' as AssetName,
              amount: '2418889379' as Amount,
            },
            {
              tokenId:
                'c868cdb63090661d815bac251aad5fcffaef94cf099e6cd81df33490.474f4c44' as TokenId,
              policyId:
                'c868cdb63090661d815bac251aad5fcffaef94cf099e6cd81df33490' as PolicyId,
              name: '474f4c44' as AssetName,
              amount: '2463889377' as Amount,
            },
            {
              tokenId:
                'ce3c3f372d4b277c3a583421bda2799a62b5b5105076b03d1e28b07b.53544b443130' as TokenId,
              policyId:
                'ce3c3f372d4b277c3a583421bda2799a62b5b5105076b03d1e28b07b' as PolicyId,
              name: '53544b443130' as AssetName,
              amount: '100' as Amount,
            },
            {
              tokenId:
                'd27197682d71905c087c5c3b61b10e6d746db0b9bef351014d75bb26.6e69636f696e' as TokenId,
              policyId:
                'd27197682d71905c087c5c3b61b10e6d746db0b9bef351014d75bb26' as PolicyId,
              name: '6e69636f696e' as AssetName,
              amount: '30499999987788' as Amount,
            },
            {
              tokenId:
                'e4214b7cce62ac6fbba385d164df48e157eae5863521b4b67ca71d86.438bb31d1920ad7fff1e0e93cab8a887eaa0b0c6754f578631f13389c3cdb0cd' as TokenId,
              policyId:
                'e4214b7cce62ac6fbba385d164df48e157eae5863521b4b67ca71d86' as PolicyId,
              name: '438bb31d1920ad7fff1e0e93cab8a887eaa0b0c6754f578631f13389c3cdb0cd' as AssetName,
              amount: '25867' as Amount,
            },
            {
              tokenId:
                'e4214b7cce62ac6fbba385d164df48e157eae5863521b4b67ca71d86.60a585ee984a47140f7c201f238d48f89585d1a9f42687750626db3a906b050a' as TokenId,
              policyId:
                'e4214b7cce62ac6fbba385d164df48e157eae5863521b4b67ca71d86' as PolicyId,
              name: '60a585ee984a47140f7c201f238d48f89585d1a9f42687750626db3a906b050a' as AssetName,
              amount: '416592' as Amount,
            },
            {
              tokenId:
                'e4214b7cce62ac6fbba385d164df48e157eae5863521b4b67ca71d86.86e90c911f058c3ebeb95a120eedd311caff3bb49d5b29ff8a9bad42005b041f' as TokenId,
              policyId:
                'e4214b7cce62ac6fbba385d164df48e157eae5863521b4b67ca71d86' as PolicyId,
              name: '86e90c911f058c3ebeb95a120eedd311caff3bb49d5b29ff8a9bad42005b041f' as AssetName,
              amount: '8613' as Amount,
            },
            {
              tokenId: primaryTokenId,
              policyId:
                'ecd07b4ef62f37a68d145de8efd60c53d288dd5ffc641215120cc3db' as PolicyId,
              name: '' as AssetName,
              amount: '9' as Amount,
            },
          ],
        },
      ],
      collateral_inputs: [],
      outputs: [
        {
          address:
            'addr_test1qqkv3gr95tsuvwmgy4fcyffpcaxta9xu3df3az4rydxtlmwv60x7wwxgjxt6865rgds3na6sezwl4j483vmm796z0f7s9c9pry' as Address,
          amount: '1000000' as Amount,
          assets: [],
        },
        {
          address:
            'addr_test1qqlywk65k52hryugsamjy8ch63kw58sfry4jv8pq57fcapdv4dlyj0kwfs0x4e38a7047lymzp37tx0y42glslcdtzhqmascap' as Address,
          amount: '971407125' as Amount,
          assets: [
            {
              tokenId:
                '08d91ec4e6c743a92de97d2fde5ca0d81493555c535894a3097061f7.c8b0' as TokenId,
              policyId:
                '08d91ec4e6c743a92de97d2fde5ca0d81493555c535894a3097061f7' as PolicyId,
              name: 'c8b0' as AssetName,
              amount: '148' as Amount,
            },
            {
              tokenId:
                '0a31cbe14cab7ce93b35cda636bd99ca77130c5ba44cb745af550c68.4e46543135' as TokenId,
              policyId:
                '0a31cbe14cab7ce93b35cda636bd99ca77130c5ba44cb745af550c68' as PolicyId,
              name: '4e46543135' as AssetName,
              amount: '1' as Amount,
            },
            {
              tokenId:
                '1ca1fc0c880d25850cb00303788dfb51bdf2f902f6dce47d1ad09d5b.44' as TokenId,
              policyId:
                '1ca1fc0c880d25850cb00303788dfb51bdf2f902f6dce47d1ad09d5b' as PolicyId,
              name: '44' as AssetName,
              amount: '2463889379' as Amount,
            },
            {
              tokenId:
                '1d129dc9c03f95a863489883914f05a52e13135994a32f0cbeacc65f.74484f444c52' as TokenId,
              policyId:
                '1d129dc9c03f95a863489883914f05a52e13135994a32f0cbeacc65f' as PolicyId,
              name: '74484f444c52' as AssetName,
              amount: '5' as Amount,
            },
            {
              tokenId:
                '29d222ce763455e3d7a09a665ce554f00ac89d2e99a1a83d267170c6.4d494e' as TokenId,
              policyId:
                '29d222ce763455e3d7a09a665ce554f00ac89d2e99a1a83d267170c6' as PolicyId,
              name: '4d494e' as AssetName,
              amount: '215410' as Amount,
            },
            {
              tokenId:
                '29d222ce763455e3d7a09a665ce554f00ac89d2e99a1a83d267170c6.4d494e74' as TokenId,
              policyId:
                '29d222ce763455e3d7a09a665ce554f00ac89d2e99a1a83d267170c6' as PolicyId,
              name: '4d494e74' as AssetName,
              amount: '179' as Amount,
            },
            {
              tokenId:
                '3eb82f197734954a140faa953203e2454421832c4b00aff63a62459d.53544b' as TokenId,
              policyId:
                '3eb82f197734954a140faa953203e2454421832c4b00aff63a62459d' as PolicyId,
              name: '53544b' as AssetName,
              amount: '93' as Amount,
            },
            {
              tokenId:
                '57575a1b17e61ade154b325dceca4c3cfe26b6f98f9b186d08583ada.66697368546f6b656e' as TokenId,
              policyId:
                '57575a1b17e61ade154b325dceca4c3cfe26b6f98f9b186d08583ada' as PolicyId,
              name: '66697368546f6b656e' as AssetName,
              amount: '133' as Amount,
            },
            {
              tokenId:
                '57fca08abbaddee36da742a839f7d83a7e1d2419f1507fcbf3916522.4d494e54' as TokenId,
              policyId:
                '57fca08abbaddee36da742a839f7d83a7e1d2419f1507fcbf3916522' as PolicyId,
              name: '4d494e54' as AssetName,
              amount: '10840562' as Amount,
            },
            {
              tokenId:
                '57fca08abbaddee36da742a839f7d83a7e1d2419f1507fcbf3916522.534245525259' as TokenId,
              policyId:
                '57fca08abbaddee36da742a839f7d83a7e1d2419f1507fcbf3916522' as PolicyId,
              name: '534245525259' as AssetName,
              amount: '3422266' as Amount,
            },
            {
              tokenId:
                '698a6ea0ca99f315034072af31eaac6ec11fe8558d3f48e9775aab9d.7444524950' as TokenId,
              policyId:
                '698a6ea0ca99f315034072af31eaac6ec11fe8558d3f48e9775aab9d' as PolicyId,
              name: '7444524950' as AssetName,
              amount: '838202298' as Amount,
            },
            {
              tokenId: primaryTokenId,
              policyId:
                '6b8d07d69639e9413dd637a1a815a7323c69c86abbafb66dbfdb1aa7' as PolicyId,
              name: '' as AssetName,
              amount: '3' as Amount,
            },
            {
              tokenId:
                '7312879acbb97007b89619c711749d4bbc51e365682daaa4f18d0759.4d696c6b6f6d656461466f6f626172' as TokenId,
              policyId:
                '7312879acbb97007b89619c711749d4bbc51e365682daaa4f18d0759' as PolicyId,
              name: '4d696c6b6f6d656461466f6f626172' as AssetName,
              amount: '4999009' as Amount,
            },
            {
              tokenId:
                '8c4662efcb7fd069c9e4003192b430e9e153e5c3e11099e3dab29772.4d4152454b' as TokenId,
              policyId:
                '8c4662efcb7fd069c9e4003192b430e9e153e5c3e11099e3dab29772' as PolicyId,
              name: '4d4152454b' as AssetName,
              amount: '633' as Amount,
            },
            {
              tokenId:
                '9e5f43a9e77e4ba2e5c5db37daee3ee0a78bc87cdea3c34f7f78523c.546f6b656e3131' as TokenId,
              policyId:
                '9e5f43a9e77e4ba2e5c5db37daee3ee0a78bc87cdea3c34f7f78523c' as PolicyId,
              name: '546f6b656e3131' as AssetName,
              amount: '1' as Amount,
            },
            {
              tokenId:
                'c85f714f2187021c7bab53741f659d0c5b1a6e7529d32b7794ff051c.474f4c44' as TokenId,
              policyId:
                'c85f714f2187021c7bab53741f659d0c5b1a6e7529d32b7794ff051c' as PolicyId,
              name: '474f4c44' as AssetName,
              amount: '2418889379' as Amount,
            },
            {
              tokenId:
                'c868cdb63090661d815bac251aad5fcffaef94cf099e6cd81df33490.474f4c44' as TokenId,
              policyId:
                'c868cdb63090661d815bac251aad5fcffaef94cf099e6cd81df33490' as PolicyId,
              name: '474f4c44' as AssetName,
              amount: '2463889377' as Amount,
            },
            {
              tokenId:
                'ce3c3f372d4b277c3a583421bda2799a62b5b5105076b03d1e28b07b.53544b443130' as TokenId,
              policyId:
                'ce3c3f372d4b277c3a583421bda2799a62b5b5105076b03d1e28b07b' as PolicyId,
              name: '53544b443130' as AssetName,
              amount: '100' as Amount,
            },
            {
              tokenId:
                'd27197682d71905c087c5c3b61b10e6d746db0b9bef351014d75bb26.6e69636f696e' as TokenId,
              policyId:
                'd27197682d71905c087c5c3b61b10e6d746db0b9bef351014d75bb26' as PolicyId,
              name: '6e69636f696e' as AssetName,
              amount: '30499999987788' as Amount,
            },
            {
              tokenId:
                'e4214b7cce62ac6fbba385d164df48e157eae5863521b4b67ca71d86.438bb31d1920ad7fff1e0e93cab8a887eaa0b0c6754f578631f13389c3cdb0cd' as TokenId,
              policyId:
                'e4214b7cce62ac6fbba385d164df48e157eae5863521b4b67ca71d86' as PolicyId,
              name: '438bb31d1920ad7fff1e0e93cab8a887eaa0b0c6754f578631f13389c3cdb0cd' as AssetName,
              amount: '25867' as Amount,
            },
            {
              tokenId:
                'e4214b7cce62ac6fbba385d164df48e157eae5863521b4b67ca71d86.60a585ee984a47140f7c201f238d48f89585d1a9f42687750626db3a906b050a' as TokenId,
              policyId:
                'e4214b7cce62ac6fbba385d164df48e157eae5863521b4b67ca71d86' as PolicyId,
              name: '60a585ee984a47140f7c201f238d48f89585d1a9f42687750626db3a906b050a' as AssetName,
              amount: '416592' as Amount,
            },
            {
              tokenId:
                'e4214b7cce62ac6fbba385d164df48e157eae5863521b4b67ca71d86.86e90c911f058c3ebeb95a120eedd311caff3bb49d5b29ff8a9bad42005b041f' as TokenId,
              policyId:
                'e4214b7cce62ac6fbba385d164df48e157eae5863521b4b67ca71d86' as PolicyId,
              name: '86e90c911f058c3ebeb95a120eedd311caff3bb49d5b29ff8a9bad42005b041f' as AssetName,
              amount: '8613' as Amount,
            },
            {
              tokenId: primaryTokenId,
              policyId:
                'ecd07b4ef62f37a68d145de8efd60c53d288dd5ffc641215120cc3db' as PolicyId,
              name: '' as AssetName,
              amount: '9' as Amount,
            },
          ],
        },
      ],
    }),
  ],
}

export const mockedTipStatusResponse: TipStatusResponse = {
  bestBlock: {
    epoch: Branded.asEpochNumber(210),
    slot: Branded.asSlotNumber(76027),
    globalSlot: Branded.asSlotNumber(60426427),
    hash: '2cf5a471a0c58cbc22534a0d437fbd91576ef10b98eea7ead5887e28f7a4fed8' as TransactionHash as unknown as BlockHash,
    height: 3617708,
  },
  safeBlock: {
    epoch: Branded.asEpochNumber(210),
    slot: Branded.asSlotNumber(75415),
    globalSlot: Branded.asSlotNumber(60425815),
    hash: 'ca18a2b607411dd18fbb2c1c0e653ec8a6a3f794f46ce050b4a07cf8ba4ab916' as TransactionHash as unknown as BlockHash,
    height: 3617698,
  },
}

export const mockedEmptyHistoryResponse: {
  isLast: boolean
  transactions: Array<WalletTransaction>
} = {
  transactions: [],
  isLast: true,
}

export const mockedEmptyLocalWalletTransactions: Record<
  string,
  WalletTransaction
> = {}

const rawMockedLocalWalletTransactions = [
  {
    key: '54ab3dc8e717040b9b4c523d0756cfc59a30f107e053b4cd474e11e818be0ddf',
    data: {
      id: '54ab3dc8e717040b9b4c523d0756cfc59a30f107e053b4cd474e11e818be0ddf',
      type: 'shelley' as const,
      fee: '207301',
      status: 'Successful',
      inputs: [
        {
          address:
            'addr_test1qz7lg9vs0yd2dwmxmc5fwwzf0x85zyeg0ssvpnvw92a73f9v4dlyj0kwfs0x4e38a7047lymzp37tx0y42glslcdtzhqhfm3hv',
          amount: '972614426',
          assets: [
            {
              amount: '148',
              tokenId:
                '08d91ec4e6c743a92de97d2fde5ca0d81493555c535894a3097061f7.c8b0',
              policyId:
                '08d91ec4e6c743a92de97d2fde5ca0d81493555c535894a3097061f7',
              name: 'c8b0',
            },
            {
              amount: '1',
              tokenId:
                '0a31cbe14cab7ce93b35cda636bd99ca77130c5ba44cb745af550c68.4e46543135',
              policyId:
                '0a31cbe14cab7ce93b35cda636bd99ca77130c5ba44cb745af550c68',
              name: '4e46543135',
            },
            {
              amount: '2463889379',
              tokenId:
                '1ca1fc0c880d25850cb00303788dfb51bdf2f902f6dce47d1ad09d5b.44',
              policyId:
                '1ca1fc0c880d25850cb00303788dfb51bdf2f902f6dce47d1ad09d5b',
              name: '44',
            },
            {
              amount: '5',
              tokenId:
                '1d129dc9c03f95a863489883914f05a52e13135994a32f0cbeacc65f.74484f444c52',
              policyId:
                '1d129dc9c03f95a863489883914f05a52e13135994a32f0cbeacc65f',
              name: '74484f444c52',
            },
            {
              amount: '215410',
              tokenId:
                '29d222ce763455e3d7a09a665ce554f00ac89d2e99a1a83d267170c6.4d494e',
              policyId:
                '29d222ce763455e3d7a09a665ce554f00ac89d2e99a1a83d267170c6',
              name: '4d494e',
            },
            {
              amount: '179',
              tokenId:
                '29d222ce763455e3d7a09a665ce554f00ac89d2e99a1a83d267170c6.4d494e74',
              policyId:
                '29d222ce763455e3d7a09a665ce554f00ac89d2e99a1a83d267170c6',
              name: '4d494e74',
            },
            {
              amount: '93',
              tokenId:
                '3eb82f197734954a140faa953203e2454421832c4b00aff63a62459d.53544b',
              policyId:
                '3eb82f197734954a140faa953203e2454421832c4b00aff63a62459d',
              name: '53544b',
            },
            {
              amount: '133',
              tokenId:
                '57575a1b17e61ade154b325dceca4c3cfe26b6f98f9b186d08583ada.66697368546f6b656e',
              policyId:
                '57575a1b17e61ade154b325dceca4c3cfe26b6f98f9b186d08583ada',
              name: '66697368546f6b656e',
            },
            {
              amount: '10840562',
              tokenId:
                '57fca08abbaddee36da742a839f7d83a7e1d2419f1507fcbf3916522.4d494e54',
              policyId:
                '57fca08abbaddee36da742a839f7d83a7e1d2419f1507fcbf3916522',
              name: '4d494e54',
            },
            {
              amount: '3422266',
              tokenId:
                '57fca08abbaddee36da742a839f7d83a7e1d2419f1507fcbf3916522.534245525259',
              policyId:
                '57fca08abbaddee36da742a839f7d83a7e1d2419f1507fcbf3916522',
              name: '534245525259',
            },
            {
              amount: '838202298',
              tokenId:
                '698a6ea0ca99f315034072af31eaac6ec11fe8558d3f48e9775aab9d.7444524950',
              policyId:
                '698a6ea0ca99f315034072af31eaac6ec11fe8558d3f48e9775aab9d',
              name: '7444524950',
            },
            {
              amount: '3',
              tokenId: primaryTokenId,
              policyId:
                '6b8d07d69639e9413dd637a1a815a7323c69c86abbafb66dbfdb1aa7',
              name: '',
            },
            {
              amount: '4999009',
              tokenId:
                '7312879acbb97007b89619c711749d4bbc51e365682daaa4f18d0759.4d696c6b6f6d656461466f6f626172',
              policyId:
                '7312879acbb97007b89619c711749d4bbc51e365682daaa4f18d0759',
              name: '4d696c6b6f6d656461466f6f626172',
            },
            {
              amount: '633',
              tokenId:
                '8c4662efcb7fd069c9e4003192b430e9e153e5c3e11099e3dab29772.4d4152454b',
              policyId:
                '8c4662efcb7fd069c9e4003192b430e9e153e5c3e11099e3dab29772',
              name: '4d4152454b',
            },
            {
              amount: '1',
              tokenId:
                '9e5f43a9e77e4ba2e5c5db37daee3ee0a78bc87cdea3c34f7f78523c.546f6b656e3131',
              policyId:
                '9e5f43a9e77e4ba2e5c5db37daee3ee0a78bc87cdea3c34f7f78523c',
              name: '546f6b656e3131',
            },
            {
              amount: '2418889379',
              tokenId:
                'c85f714f2187021c7bab53741f659d0c5b1a6e7529d32b7794ff051c.474f4c44',
              policyId:
                'c85f714f2187021c7bab53741f659d0c5b1a6e7529d32b7794ff051c',
              name: '474f4c44',
            },
            {
              amount: '2463889377',
              tokenId:
                'c868cdb63090661d815bac251aad5fcffaef94cf099e6cd81df33490.474f4c44',
              policyId:
                'c868cdb63090661d815bac251aad5fcffaef94cf099e6cd81df33490',
              name: '474f4c44',
            },
            {
              amount: '100',
              tokenId:
                'ce3c3f372d4b277c3a583421bda2799a62b5b5105076b03d1e28b07b.53544b443130',
              policyId:
                'ce3c3f372d4b277c3a583421bda2799a62b5b5105076b03d1e28b07b',
              name: '53544b443130',
            },
            {
              amount: '30499999987788',
              tokenId:
                'd27197682d71905c087c5c3b61b10e6d746db0b9bef351014d75bb26.6e69636f696e',
              policyId:
                'd27197682d71905c087c5c3b61b10e6d746db0b9bef351014d75bb26',
              name: '6e69636f696e',
            },
            {
              amount: '25867',
              tokenId:
                'e4214b7cce62ac6fbba385d164df48e157eae5863521b4b67ca71d86.438bb31d1920ad7fff1e0e93cab8a887eaa0b0c6754f578631f13389c3cdb0cd',
              policyId:
                'e4214b7cce62ac6fbba385d164df48e157eae5863521b4b67ca71d86',
              name: '438bb31d1920ad7fff1e0e93cab8a887eaa0b0c6754f578631f13389c3cdb0cd',
            },
            {
              amount: '416592',
              tokenId:
                'e4214b7cce62ac6fbba385d164df48e157eae5863521b4b67ca71d86.60a585ee984a47140f7c201f238d48f89585d1a9f42687750626db3a906b050a',
              policyId:
                'e4214b7cce62ac6fbba385d164df48e157eae5863521b4b67ca71d86',
              name: '60a585ee984a47140f7c201f238d48f89585d1a9f42687750626db3a906b050a',
            },
            {
              amount: '8613',
              tokenId:
                'e4214b7cce62ac6fbba385d164df48e157eae5863521b4b67ca71d86.86e90c911f058c3ebeb95a120eedd311caff3bb49d5b29ff8a9bad42005b041f',
              policyId:
                'e4214b7cce62ac6fbba385d164df48e157eae5863521b4b67ca71d86',
              name: '86e90c911f058c3ebeb95a120eedd311caff3bb49d5b29ff8a9bad42005b041f',
            },
            {
              amount: '9',
              tokenId: primaryTokenId,
              policyId:
                'ecd07b4ef62f37a68d145de8efd60c53d288dd5ffc641215120cc3db',
              name: '',
            },
          ],
        },
      ],
      outputs: [
        {
          address:
            'addr_test1qqkv3gr95tsuvwmgy4fcyffpcaxta9xu3df3az4rydxtlmwv60x7wwxgjxt6865rgds3na6sezwl4j483vmm796z0f7s9c9pry',
          amount: '1000000',
          assets: [],
        },
        {
          address:
            'addr_test1qqlywk65k52hryugsamjy8ch63kw58sfry4jv8pq57fcapdv4dlyj0kwfs0x4e38a7047lymzp37tx0y42glslcdtzhqmascap',
          amount: '971407125',
          assets: [
            {
              amount: '148',
              tokenId:
                '08d91ec4e6c743a92de97d2fde5ca0d81493555c535894a3097061f7.c8b0',
              policyId:
                '08d91ec4e6c743a92de97d2fde5ca0d81493555c535894a3097061f7',
              name: 'c8b0',
            },
            {
              amount: '1',
              tokenId:
                '0a31cbe14cab7ce93b35cda636bd99ca77130c5ba44cb745af550c68.4e46543135',
              policyId:
                '0a31cbe14cab7ce93b35cda636bd99ca77130c5ba44cb745af550c68',
              name: '4e46543135',
            },
            {
              amount: '2463889379',
              tokenId:
                '1ca1fc0c880d25850cb00303788dfb51bdf2f902f6dce47d1ad09d5b.44',
              policyId:
                '1ca1fc0c880d25850cb00303788dfb51bdf2f902f6dce47d1ad09d5b',
              name: '44',
            },
            {
              amount: '5',
              tokenId:
                '1d129dc9c03f95a863489883914f05a52e13135994a32f0cbeacc65f.74484f444c52',
              policyId:
                '1d129dc9c03f95a863489883914f05a52e13135994a32f0cbeacc65f',
              name: '74484f444c52',
            },
            {
              amount: '215410',
              tokenId:
                '29d222ce763455e3d7a09a665ce554f00ac89d2e99a1a83d267170c6.4d494e',
              policyId:
                '29d222ce763455e3d7a09a665ce554f00ac89d2e99a1a83d267170c6',
              name: '4d494e',
            },
            {
              amount: '179',
              tokenId:
                '29d222ce763455e3d7a09a665ce554f00ac89d2e99a1a83d267170c6.4d494e74',
              policyId:
                '29d222ce763455e3d7a09a665ce554f00ac89d2e99a1a83d267170c6',
              name: '4d494e74',
            },
            {
              amount: '93',
              tokenId:
                '3eb82f197734954a140faa953203e2454421832c4b00aff63a62459d.53544b',
              policyId:
                '3eb82f197734954a140faa953203e2454421832c4b00aff63a62459d',
              name: '53544b',
            },
            {
              amount: '133',
              tokenId:
                '57575a1b17e61ade154b325dceca4c3cfe26b6f98f9b186d08583ada.66697368546f6b656e',
              policyId:
                '57575a1b17e61ade154b325dceca4c3cfe26b6f98f9b186d08583ada',
              name: '66697368546f6b656e',
            },
            {
              amount: '10840562',
              tokenId:
                '57fca08abbaddee36da742a839f7d83a7e1d2419f1507fcbf3916522.4d494e54',
              policyId:
                '57fca08abbaddee36da742a839f7d83a7e1d2419f1507fcbf3916522',
              name: '4d494e54',
            },
            {
              amount: '3422266',
              tokenId:
                '57fca08abbaddee36da742a839f7d83a7e1d2419f1507fcbf3916522.534245525259',
              policyId:
                '57fca08abbaddee36da742a839f7d83a7e1d2419f1507fcbf3916522',
              name: '534245525259',
            },
            {
              amount: '838202298',
              tokenId:
                '698a6ea0ca99f315034072af31eaac6ec11fe8558d3f48e9775aab9d.7444524950',
              policyId:
                '698a6ea0ca99f315034072af31eaac6ec11fe8558d3f48e9775aab9d',
              name: '7444524950',
            },
            {
              amount: '3',
              tokenId: primaryTokenId,
              policyId:
                '6b8d07d69639e9413dd637a1a815a7323c69c86abbafb66dbfdb1aa7',
              name: '',
            },
            {
              amount: '4999009',
              tokenId:
                '7312879acbb97007b89619c711749d4bbc51e365682daaa4f18d0759.4d696c6b6f6d656461466f6f626172',
              policyId:
                '7312879acbb97007b89619c711749d4bbc51e365682daaa4f18d0759',
              name: '4d696c6b6f6d656461466f6f626172',
            },
            {
              amount: '633',
              tokenId:
                '8c4662efcb7fd069c9e4003192b430e9e153e5c3e11099e3dab29772.4d4152454b',
              policyId:
                '8c4662efcb7fd069c9e4003192b430e9e153e5c3e11099e3dab29772',
              name: '4d4152454b',
            },
            {
              amount: '1',
              tokenId:
                '9e5f43a9e77e4ba2e5c5db37daee3ee0a78bc87cdea3c34f7f78523c.546f6b656e3131',
              policyId:
                '9e5f43a9e77e4ba2e5c5db37daee3ee0a78bc87cdea3c34f7f78523c',
              name: '546f6b656e3131',
            },
            {
              amount: '2418889379',
              tokenId:
                'c85f714f2187021c7bab53741f659d0c5b1a6e7529d32b7794ff051c.474f4c44',
              policyId:
                'c85f714f2187021c7bab53741f659d0c5b1a6e7529d32b7794ff051c',
              name: '474f4c44',
            },
            {
              amount: '2463889377',
              tokenId:
                'c868cdb63090661d815bac251aad5fcffaef94cf099e6cd81df33490.474f4c44',
              policyId:
                'c868cdb63090661d815bac251aad5fcffaef94cf099e6cd81df33490',
              name: '474f4c44',
            },
            {
              amount: '100',
              tokenId:
                'ce3c3f372d4b277c3a583421bda2799a62b5b5105076b03d1e28b07b.53544b443130',
              policyId:
                'ce3c3f372d4b277c3a583421bda2799a62b5b5105076b03d1e28b07b',
              name: '53544b443130',
            },
            {
              amount: '30499999987788',
              tokenId:
                'd27197682d71905c087c5c3b61b10e6d746db0b9bef351014d75bb26.6e69636f696e',
              policyId:
                'd27197682d71905c087c5c3b61b10e6d746db0b9bef351014d75bb26',
              name: '6e69636f696e',
            },
            {
              amount: '25867',
              tokenId:
                'e4214b7cce62ac6fbba385d164df48e157eae5863521b4b67ca71d86.438bb31d1920ad7fff1e0e93cab8a887eaa0b0c6754f578631f13389c3cdb0cd',
              policyId:
                'e4214b7cce62ac6fbba385d164df48e157eae5863521b4b67ca71d86',
              name: '438bb31d1920ad7fff1e0e93cab8a887eaa0b0c6754f578631f13389c3cdb0cd',
            },
            {
              amount: '416592',
              tokenId:
                'e4214b7cce62ac6fbba385d164df48e157eae5863521b4b67ca71d86.60a585ee984a47140f7c201f238d48f89585d1a9f42687750626db3a906b050a',
              policyId:
                'e4214b7cce62ac6fbba385d164df48e157eae5863521b4b67ca71d86',
              name: '60a585ee984a47140f7c201f238d48f89585d1a9f42687750626db3a906b050a',
            },
            {
              amount: '8613',
              tokenId:
                'e4214b7cce62ac6fbba385d164df48e157eae5863521b4b67ca71d86.86e90c911f058c3ebeb95a120eedd311caff3bb49d5b29ff8a9bad42005b041f',
              policyId:
                'e4214b7cce62ac6fbba385d164df48e157eae5863521b4b67ca71d86',
              name: '86e90c911f058c3ebeb95a120eedd311caff3bb49d5b29ff8a9bad42005b041f',
            },
            {
              amount: '9',
              tokenId: primaryTokenId,
              policyId:
                'ecd07b4ef62f37a68d145de8efd60c53d288dd5ffc641215120cc3db',
              name: '',
            },
          ],
        },
      ],
      lastUpdatedAt: '2022-06-12T23:46:47.000Z',
      submittedAt: '2022-06-12T23:46:47.000Z',
      blockNum: 3626415,
      blockHash:
        '3be6615c2711f8c85e5777d1a060682bba507551d99d3568569fe8dfb7dcc690',
      txOrdinal: 5,
      epoch: 210,
      slot: 357991,
      withdrawals: [],
      certificates: [],
      validContract: true,
      scriptSize: 0,
      collateralInputs: [],
      memo: null,
    },
  },
]

export const mockedLocalWalletTransactions = Object.fromEntries(
  rawMockedLocalWalletTransactions.map(({key, data}) => [
    key,
    createMockWalletTransaction(data),
  ]),
) satisfies Record<string, WalletTransaction>

// Backward compatibility aliases
export const mockedEmptyLocalTransactions = mockedEmptyLocalWalletTransactions
export const mockedLocalTransactions = mockedLocalWalletTransactions
