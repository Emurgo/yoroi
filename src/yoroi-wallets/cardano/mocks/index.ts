import {BackendConfig, RawTransaction, TipStatusResponse, Transaction} from '../../types/other'

export const mockedBackendConfig: BackendConfig = {
  API_ROOT: 'https://fakeapiroot.com',
  TOKEN_INFO_SERVICE: 'https://faketokeninfoservice.com',
  NFT_STORAGE_URL: 'https://fakenftstorageurl.com',
  FETCH_UTXOS_MAX_ADDRESSES: 2,
  TX_HISTORY_MAX_ADDRESSES: 2,
  FILTER_USED_MAX_ADDRESSES: 2,
  TX_HISTORY_RESPONSE_LIMIT: 2,
}

export const mockTx: Transaction = {
  id: '0a8962dde362eef1f840defe6f916fdf9701ad53c7cb5dd4a74ab85df8e9bffc',
  type: 'shelley',
  fee: '179537',
  status: 'Successful',
  inputs: [
    {
      address:
        'addr_test1qrrdv3uxj8shu27ea9djvnn3rl4w3lvh3cyck6yc36mvf6ctlqxj9g0azvpycncr9u600p6t556qhc3psk06uzzw6saq4kvdpq',
      amount: '967141533',
      assets: [
        {
          amount: '1',
          assetId: '57e37bc9a9c0a099a6636c3deb93b82e7edec8a9a40883017bae2674.717171717171',
          policyId: '57e37bc9a9c0a099a6636c3deb93b82e7edec8a9a40883017bae2674',
          name: '717171717171',
        },
        {
          amount: '1',
          assetId: 'fc53320cfda5add9cde1e7094c73596eacc26dbe79834b67c14b5dad.656565656565',
          policyId: 'fc53320cfda5add9cde1e7094c73596eacc26dbe79834b67c14b5dad',
          name: '656565656565',
        },
      ],
    },
    {
      address:
        'addr_test1qqgxd3r59psq0dg33t7asmvjmtu55tvvcmeq5kmhj0tmqjctlqxj9g0azvpycncr9u600p6t556qhc3psk06uzzw6saqk4x7z6',
      amount: '2000000',
      assets: [
        {
          amount: '1',
          assetId: '0b71c073fcf017eeff0664070c790a2bcc47077566904be471c46c13.727272727272',
          policyId: '0b71c073fcf017eeff0664070c790a2bcc47077566904be471c46c13',
          name: '727272727272',
        },
      ],
    },
  ],
  outputs: [
    {
      address:
        'addr_test1qrxlnftwl73taxvcapnhgctae895l582a6r7k7jjeuwvzp0rvvww4m29k4km54utxag3mlhdsr73m62rsae6ad3hj6kqcexkh8',
      amount: '7305977',
      assets: [],
    },
    {
      address:
        'addr_test1qrqzse20fh7mmt5k9xf4sug3a2lh5fa7x9nr98avp0ac78stlqxj9g0azvpycncr9u600p6t556qhc3psk06uzzw6saq6xr7ra',
      amount: '961656019',
      assets: [
        {
          amount: '1',
          assetId: '0b71c073fcf017eeff0664070c790a2bcc47077566904be471c46c13.727272727272',
          policyId: '0b71c073fcf017eeff0664070c790a2bcc47077566904be471c46c13',
          name: '727272727272',
        },
        {
          amount: '1',
          assetId: '57e37bc9a9c0a099a6636c3deb93b82e7edec8a9a40883017bae2674.717171717171',
          policyId: '57e37bc9a9c0a099a6636c3deb93b82e7edec8a9a40883017bae2674',
          name: '717171717171',
        },
        {
          amount: '1',
          assetId: 'fc53320cfda5add9cde1e7094c73596eacc26dbe79834b67c14b5dad.656565656565',
          policyId: 'fc53320cfda5add9cde1e7094c73596eacc26dbe79834b67c14b5dad',
          name: '656565656565',
        },
      ],
    },
  ],
  lastUpdatedAt: '2021-09-13T18:42:10.000Z',
  submittedAt: '2021-09-13T18:42:10.000Z',
  blockNum: 2909238,
  blockHash: 'fb418acaa29c66e799a16b594f7beedfe2ef53413e9863b61a418f2df1ff1442',
  txOrdinal: 0,
  epoch: 156,
  slot: 166914,
  withdrawals: [],
  certificates: [
    {
      kind: 'StakeDeregistration',
      rewardAddress: 'e0acab7e493ece4c1e6ae627ef9f5f7c9b1063e599e4aa91f87f0d58ae',
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
  ['addr_test1qqlywk65k52hryugsamjy8ch63kw58sfry4jv8pq57fcapdv4dlyj0kwfs0x4e38a7047lymzp37tx0y42glslcdtzhqmascap'],
  ['stake_test18pq57fcj0kwfs0x4e38tzhqm'],
]

export const mockedHistoryResponse: {isLast: boolean; transactions: Array<RawTransaction>} = {
  isLast: true,
  transactions: [
    {
      hash: '54ab3dc8e717040b9b4c523d0756cfc59a30f107e053b4cd474e11e818be0ddg',
      fee: '207301',
      valid_contract: true,
      script_size: 0,
      type: 'shelley',
      withdrawals: [],
      certificates: [
        {
          kind: 'StakeRegistration',
          rewardAddress: 'e0acab7e493ece4c1e6ae627ef9f5f7c9b1063e599e4aa91f87f0d58ae',
        },
        {
          kind: 'StakeDelegation',
          poolKeyHash: '8a77ce4ffc0c690419675aa5396df9a38c9cd20e36483d2d2465ce86',
          rewardAddress: 'e0acab7e493ece4c1e6ae627ef9f5f7c9b1063e599e4aa91f87f0d58ae',
        },
      ],
      tx_ordinal: 6,
      tx_state: 'Successful',
      last_update: '2022-06-12T23:46:47.000Z',
      block_num: 3626416,
      block_hash: '3be6615c2711f8c85e5777d1a060682bba507551d99d3568569fe8dfb7dcc690',
      time: '2022-06-12T23:46:47.000Z',
      epoch: 210,
      slot: 357991,
      inputs: [
        {
          address:
            'addr_test1qz7lg9vs0yd2dwmxmc5fwwzf0x85zyeg0ssvpnvw92a73f9v4dlyj0kwfs0x4e38a7047lymzp37tx0y42glslcdtzhqhfm3hv',
          amount: '972614426',
          id: '7bbdb2c383b2a87d6b6e596af4784c0460837018b795597cb5f284ea74d967161',
          index: 1,
          txHash: '7bbdb2c383b2a87d6b6e596af4784c0460837018b795597cb5f284ea74d96716',
          assets: [
            {
              assetId: '08d91ec4e6c743a92de97d2fde5ca0d81493555c535894a3097061f7.c8b0',
              policyId: '08d91ec4e6c743a92de97d2fde5ca0d81493555c535894a3097061f7',
              name: 'c8b0',
              amount: '148',
            },
            {
              assetId: '0a31cbe14cab7ce93b35cda636bd99ca77130c5ba44cb745af550c68.4e46543135',
              policyId: '0a31cbe14cab7ce93b35cda636bd99ca77130c5ba44cb745af550c68',
              name: '4e46543135',
              amount: '1',
            },
            {
              assetId: '1ca1fc0c880d25850cb00303788dfb51bdf2f902f6dce47d1ad09d5b.44',
              policyId: '1ca1fc0c880d25850cb00303788dfb51bdf2f902f6dce47d1ad09d5b',
              name: '44',
              amount: '2463889379',
            },
            {
              assetId: '1d129dc9c03f95a863489883914f05a52e13135994a32f0cbeacc65f.74484f444c52',
              policyId: '1d129dc9c03f95a863489883914f05a52e13135994a32f0cbeacc65f',
              name: '74484f444c52',
              amount: '5',
            },
            {
              assetId: '29d222ce763455e3d7a09a665ce554f00ac89d2e99a1a83d267170c6.4d494e',
              policyId: '29d222ce763455e3d7a09a665ce554f00ac89d2e99a1a83d267170c6',
              name: '4d494e',
              amount: '215410',
            },
            {
              assetId: '29d222ce763455e3d7a09a665ce554f00ac89d2e99a1a83d267170c6.4d494e74',
              policyId: '29d222ce763455e3d7a09a665ce554f00ac89d2e99a1a83d267170c6',
              name: '4d494e74',
              amount: '179',
            },
            {
              assetId: '3eb82f197734954a140faa953203e2454421832c4b00aff63a62459d.53544b',
              policyId: '3eb82f197734954a140faa953203e2454421832c4b00aff63a62459d',
              name: '53544b',
              amount: '93',
            },
            {
              assetId: '57575a1b17e61ade154b325dceca4c3cfe26b6f98f9b186d08583ada.66697368546f6b656e',
              policyId: '57575a1b17e61ade154b325dceca4c3cfe26b6f98f9b186d08583ada',
              name: '66697368546f6b656e',
              amount: '133',
            },
            {
              assetId: '57fca08abbaddee36da742a839f7d83a7e1d2419f1507fcbf3916522.4d494e54',
              policyId: '57fca08abbaddee36da742a839f7d83a7e1d2419f1507fcbf3916522',
              name: '4d494e54',
              amount: '10840562',
            },
            {
              assetId: '57fca08abbaddee36da742a839f7d83a7e1d2419f1507fcbf3916522.534245525259',
              policyId: '57fca08abbaddee36da742a839f7d83a7e1d2419f1507fcbf3916522',
              name: '534245525259',
              amount: '3422266',
            },
            {
              assetId: '698a6ea0ca99f315034072af31eaac6ec11fe8558d3f48e9775aab9d.7444524950',
              policyId: '698a6ea0ca99f315034072af31eaac6ec11fe8558d3f48e9775aab9d',
              name: '7444524950',
              amount: '838202298',
            },
            {
              assetId: '6b8d07d69639e9413dd637a1a815a7323c69c86abbafb66dbfdb1aa7',
              policyId: '6b8d07d69639e9413dd637a1a815a7323c69c86abbafb66dbfdb1aa7',
              name: '',
              amount: '3',
            },
            {
              assetId: '7312879acbb97007b89619c711749d4bbc51e365682daaa4f18d0759.4d696c6b6f6d656461466f6f626172',
              policyId: '7312879acbb97007b89619c711749d4bbc51e365682daaa4f18d0759',
              name: '4d696c6b6f6d656461466f6f626172',
              amount: '4999009',
            },
            {
              assetId: '8c4662efcb7fd069c9e4003192b430e9e153e5c3e11099e3dab29772.4d4152454b',
              policyId: '8c4662efcb7fd069c9e4003192b430e9e153e5c3e11099e3dab29772',
              name: '4d4152454b',
              amount: '633',
            },
            {
              assetId: '9e5f43a9e77e4ba2e5c5db37daee3ee0a78bc87cdea3c34f7f78523c.546f6b656e3131',
              policyId: '9e5f43a9e77e4ba2e5c5db37daee3ee0a78bc87cdea3c34f7f78523c',
              name: '546f6b656e3131',
              amount: '1',
            },
            {
              assetId: 'c85f714f2187021c7bab53741f659d0c5b1a6e7529d32b7794ff051c.474f4c44',
              policyId: 'c85f714f2187021c7bab53741f659d0c5b1a6e7529d32b7794ff051c',
              name: '474f4c44',
              amount: '2418889379',
            },
            {
              assetId: 'c868cdb63090661d815bac251aad5fcffaef94cf099e6cd81df33490.474f4c44',
              policyId: 'c868cdb63090661d815bac251aad5fcffaef94cf099e6cd81df33490',
              name: '474f4c44',
              amount: '2463889377',
            },
            {
              assetId: 'ce3c3f372d4b277c3a583421bda2799a62b5b5105076b03d1e28b07b.53544b443130',
              policyId: 'ce3c3f372d4b277c3a583421bda2799a62b5b5105076b03d1e28b07b',
              name: '53544b443130',
              amount: '100',
            },
            {
              assetId: 'd27197682d71905c087c5c3b61b10e6d746db0b9bef351014d75bb26.6e69636f696e',
              policyId: 'd27197682d71905c087c5c3b61b10e6d746db0b9bef351014d75bb26',
              name: '6e69636f696e',
              amount: '30499999987788',
            },
            {
              assetId:
                'e4214b7cce62ac6fbba385d164df48e157eae5863521b4b67ca71d86.438bb31d1920ad7fff1e0e93cab8a887eaa0b0c6754f578631f13389c3cdb0cd',
              policyId: 'e4214b7cce62ac6fbba385d164df48e157eae5863521b4b67ca71d86',
              name: '438bb31d1920ad7fff1e0e93cab8a887eaa0b0c6754f578631f13389c3cdb0cd',
              amount: '25867',
            },
            {
              assetId:
                'e4214b7cce62ac6fbba385d164df48e157eae5863521b4b67ca71d86.60a585ee984a47140f7c201f238d48f89585d1a9f42687750626db3a906b050a',
              policyId: 'e4214b7cce62ac6fbba385d164df48e157eae5863521b4b67ca71d86',
              name: '60a585ee984a47140f7c201f238d48f89585d1a9f42687750626db3a906b050a',
              amount: '416592',
            },
            {
              assetId:
                'e4214b7cce62ac6fbba385d164df48e157eae5863521b4b67ca71d86.86e90c911f058c3ebeb95a120eedd311caff3bb49d5b29ff8a9bad42005b041f',
              policyId: 'e4214b7cce62ac6fbba385d164df48e157eae5863521b4b67ca71d86',
              name: '86e90c911f058c3ebeb95a120eedd311caff3bb49d5b29ff8a9bad42005b041f',
              amount: '8613',
            },
            {
              assetId: 'ecd07b4ef62f37a68d145de8efd60c53d288dd5ffc641215120cc3db.',
              policyId: 'ecd07b4ef62f37a68d145de8efd60c53d288dd5ffc641215120cc3db',
              name: '',
              amount: '9',
            },
          ],
        },
      ],
      collateral_inputs: [],
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
              assetId: '08d91ec4e6c743a92de97d2fde5ca0d81493555c535894a3097061f7.c8b0',
              policyId: '08d91ec4e6c743a92de97d2fde5ca0d81493555c535894a3097061f7',
              name: 'c8b0',
              amount: '148',
            },
            {
              assetId: '0a31cbe14cab7ce93b35cda636bd99ca77130c5ba44cb745af550c68.4e46543135',
              policyId: '0a31cbe14cab7ce93b35cda636bd99ca77130c5ba44cb745af550c68',
              name: '4e46543135',
              amount: '1',
            },
            {
              assetId: '1ca1fc0c880d25850cb00303788dfb51bdf2f902f6dce47d1ad09d5b.44',
              policyId: '1ca1fc0c880d25850cb00303788dfb51bdf2f902f6dce47d1ad09d5b',
              name: '44',
              amount: '2463889379',
            },
            {
              assetId: '1d129dc9c03f95a863489883914f05a52e13135994a32f0cbeacc65f.74484f444c52',
              policyId: '1d129dc9c03f95a863489883914f05a52e13135994a32f0cbeacc65f',
              name: '74484f444c52',
              amount: '5',
            },
            {
              assetId: '29d222ce763455e3d7a09a665ce554f00ac89d2e99a1a83d267170c6.4d494e',
              policyId: '29d222ce763455e3d7a09a665ce554f00ac89d2e99a1a83d267170c6',
              name: '4d494e',
              amount: '215410',
            },
            {
              assetId: '29d222ce763455e3d7a09a665ce554f00ac89d2e99a1a83d267170c6.4d494e74',
              policyId: '29d222ce763455e3d7a09a665ce554f00ac89d2e99a1a83d267170c6',
              name: '4d494e74',
              amount: '179',
            },
            {
              assetId: '3eb82f197734954a140faa953203e2454421832c4b00aff63a62459d.53544b',
              policyId: '3eb82f197734954a140faa953203e2454421832c4b00aff63a62459d',
              name: '53544b',
              amount: '93',
            },
            {
              assetId: '57575a1b17e61ade154b325dceca4c3cfe26b6f98f9b186d08583ada.66697368546f6b656e',
              policyId: '57575a1b17e61ade154b325dceca4c3cfe26b6f98f9b186d08583ada',
              name: '66697368546f6b656e',
              amount: '133',
            },
            {
              assetId: '57fca08abbaddee36da742a839f7d83a7e1d2419f1507fcbf3916522.4d494e54',
              policyId: '57fca08abbaddee36da742a839f7d83a7e1d2419f1507fcbf3916522',
              name: '4d494e54',
              amount: '10840562',
            },
            {
              assetId: '57fca08abbaddee36da742a839f7d83a7e1d2419f1507fcbf3916522.534245525259',
              policyId: '57fca08abbaddee36da742a839f7d83a7e1d2419f1507fcbf3916522',
              name: '534245525259',
              amount: '3422266',
            },
            {
              assetId: '698a6ea0ca99f315034072af31eaac6ec11fe8558d3f48e9775aab9d.7444524950',
              policyId: '698a6ea0ca99f315034072af31eaac6ec11fe8558d3f48e9775aab9d',
              name: '7444524950',
              amount: '838202298',
            },
            {
              assetId: '6b8d07d69639e9413dd637a1a815a7323c69c86abbafb66dbfdb1aa7',
              policyId: '6b8d07d69639e9413dd637a1a815a7323c69c86abbafb66dbfdb1aa7',
              name: '',
              amount: '3',
            },
            {
              assetId: '7312879acbb97007b89619c711749d4bbc51e365682daaa4f18d0759.4d696c6b6f6d656461466f6f626172',
              policyId: '7312879acbb97007b89619c711749d4bbc51e365682daaa4f18d0759',
              name: '4d696c6b6f6d656461466f6f626172',
              amount: '4999009',
            },
            {
              assetId: '8c4662efcb7fd069c9e4003192b430e9e153e5c3e11099e3dab29772.4d4152454b',
              policyId: '8c4662efcb7fd069c9e4003192b430e9e153e5c3e11099e3dab29772',
              name: '4d4152454b',
              amount: '633',
            },
            {
              assetId: '9e5f43a9e77e4ba2e5c5db37daee3ee0a78bc87cdea3c34f7f78523c.546f6b656e3131',
              policyId: '9e5f43a9e77e4ba2e5c5db37daee3ee0a78bc87cdea3c34f7f78523c',
              name: '546f6b656e3131',
              amount: '1',
            },
            {
              assetId: 'c85f714f2187021c7bab53741f659d0c5b1a6e7529d32b7794ff051c.474f4c44',
              policyId: 'c85f714f2187021c7bab53741f659d0c5b1a6e7529d32b7794ff051c',
              name: '474f4c44',
              amount: '2418889379',
            },
            {
              assetId: 'c868cdb63090661d815bac251aad5fcffaef94cf099e6cd81df33490.474f4c44',
              policyId: 'c868cdb63090661d815bac251aad5fcffaef94cf099e6cd81df33490',
              name: '474f4c44',
              amount: '2463889377',
            },
            {
              assetId: 'ce3c3f372d4b277c3a583421bda2799a62b5b5105076b03d1e28b07b.53544b443130',
              policyId: 'ce3c3f372d4b277c3a583421bda2799a62b5b5105076b03d1e28b07b',
              name: '53544b443130',
              amount: '100',
            },
            {
              assetId: 'd27197682d71905c087c5c3b61b10e6d746db0b9bef351014d75bb26.6e69636f696e',
              policyId: 'd27197682d71905c087c5c3b61b10e6d746db0b9bef351014d75bb26',
              name: '6e69636f696e',
              amount: '30499999987788',
            },
            {
              assetId:
                'e4214b7cce62ac6fbba385d164df48e157eae5863521b4b67ca71d86.438bb31d1920ad7fff1e0e93cab8a887eaa0b0c6754f578631f13389c3cdb0cd',
              policyId: 'e4214b7cce62ac6fbba385d164df48e157eae5863521b4b67ca71d86',
              name: '438bb31d1920ad7fff1e0e93cab8a887eaa0b0c6754f578631f13389c3cdb0cd',
              amount: '25867',
            },
            {
              assetId:
                'e4214b7cce62ac6fbba385d164df48e157eae5863521b4b67ca71d86.60a585ee984a47140f7c201f238d48f89585d1a9f42687750626db3a906b050a',
              policyId: 'e4214b7cce62ac6fbba385d164df48e157eae5863521b4b67ca71d86',
              name: '60a585ee984a47140f7c201f238d48f89585d1a9f42687750626db3a906b050a',
              amount: '416592',
            },
            {
              assetId:
                'e4214b7cce62ac6fbba385d164df48e157eae5863521b4b67ca71d86.86e90c911f058c3ebeb95a120eedd311caff3bb49d5b29ff8a9bad42005b041f',
              policyId: 'e4214b7cce62ac6fbba385d164df48e157eae5863521b4b67ca71d86',
              name: '86e90c911f058c3ebeb95a120eedd311caff3bb49d5b29ff8a9bad42005b041f',
              amount: '8613',
            },
            {
              assetId: 'ecd07b4ef62f37a68d145de8efd60c53d288dd5ffc641215120cc3db.',
              policyId: 'ecd07b4ef62f37a68d145de8efd60c53d288dd5ffc641215120cc3db',
              name: '',
              amount: '9',
            },
          ],
        },
      ],
    },
  ],
}

export const mockedTipStatusResponse: TipStatusResponse = {
  bestBlock: {
    epoch: 210,
    slot: 76027,
    globalSlot: 60426427,
    hash: '2cf5a471a0c58cbc22534a0d437fbd91576ef10b98eea7ead5887e28f7a4fed8',
    height: 3617708,
  },
  safeBlock: {
    epoch: 210,
    slot: 75415,
    globalSlot: 60425815,
    hash: 'ca18a2b607411dd18fbb2c1c0e653ec8a6a3f794f46ce050b4a07cf8ba4ab916',
    height: 3617698,
  },
}

export const mockedEmptyHistoryResponse: {isLast: boolean; transactions: Array<RawTransaction>} = {
  transactions: [],
  isLast: true,
}

export const mockedEmptyLocalTransactions: Record<string, Transaction> = {}

export const mockedLocalTransactions: Record<string, Transaction> = {
  '54ab3dc8e717040b9b4c523d0756cfc59a30f107e053b4cd474e11e818be0ddf': {
    id: '54ab3dc8e717040b9b4c523d0756cfc59a30f107e053b4cd474e11e818be0ddf',
    type: 'shelley',
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
            assetId: '08d91ec4e6c743a92de97d2fde5ca0d81493555c535894a3097061f7.c8b0',
            policyId: '08d91ec4e6c743a92de97d2fde5ca0d81493555c535894a3097061f7',
            name: 'c8b0',
          },
          {
            amount: '1',
            assetId: '0a31cbe14cab7ce93b35cda636bd99ca77130c5ba44cb745af550c68.4e46543135',
            policyId: '0a31cbe14cab7ce93b35cda636bd99ca77130c5ba44cb745af550c68',
            name: '4e46543135',
          },
          {
            amount: '2463889379',
            assetId: '1ca1fc0c880d25850cb00303788dfb51bdf2f902f6dce47d1ad09d5b.44',
            policyId: '1ca1fc0c880d25850cb00303788dfb51bdf2f902f6dce47d1ad09d5b',
            name: '44',
          },
          {
            amount: '5',
            assetId: '1d129dc9c03f95a863489883914f05a52e13135994a32f0cbeacc65f.74484f444c52',
            policyId: '1d129dc9c03f95a863489883914f05a52e13135994a32f0cbeacc65f',
            name: '74484f444c52',
          },
          {
            amount: '215410',
            assetId: '29d222ce763455e3d7a09a665ce554f00ac89d2e99a1a83d267170c6.4d494e',
            policyId: '29d222ce763455e3d7a09a665ce554f00ac89d2e99a1a83d267170c6',
            name: '4d494e',
          },
          {
            amount: '179',
            assetId: '29d222ce763455e3d7a09a665ce554f00ac89d2e99a1a83d267170c6.4d494e74',
            policyId: '29d222ce763455e3d7a09a665ce554f00ac89d2e99a1a83d267170c6',
            name: '4d494e74',
          },
          {
            amount: '93',
            assetId: '3eb82f197734954a140faa953203e2454421832c4b00aff63a62459d.53544b',
            policyId: '3eb82f197734954a140faa953203e2454421832c4b00aff63a62459d',
            name: '53544b',
          },
          {
            amount: '133',
            assetId: '57575a1b17e61ade154b325dceca4c3cfe26b6f98f9b186d08583ada.66697368546f6b656e',
            policyId: '57575a1b17e61ade154b325dceca4c3cfe26b6f98f9b186d08583ada',
            name: '66697368546f6b656e',
          },
          {
            amount: '10840562',
            assetId: '57fca08abbaddee36da742a839f7d83a7e1d2419f1507fcbf3916522.4d494e54',
            policyId: '57fca08abbaddee36da742a839f7d83a7e1d2419f1507fcbf3916522',
            name: '4d494e54',
          },
          {
            amount: '3422266',
            assetId: '57fca08abbaddee36da742a839f7d83a7e1d2419f1507fcbf3916522.534245525259',
            policyId: '57fca08abbaddee36da742a839f7d83a7e1d2419f1507fcbf3916522',
            name: '534245525259',
          },
          {
            amount: '838202298',
            assetId: '698a6ea0ca99f315034072af31eaac6ec11fe8558d3f48e9775aab9d.7444524950',
            policyId: '698a6ea0ca99f315034072af31eaac6ec11fe8558d3f48e9775aab9d',
            name: '7444524950',
          },
          {
            amount: '3',
            assetId: '6b8d07d69639e9413dd637a1a815a7323c69c86abbafb66dbfdb1aa7',
            policyId: '6b8d07d69639e9413dd637a1a815a7323c69c86abbafb66dbfdb1aa7',
            name: '',
          },
          {
            amount: '4999009',
            assetId: '7312879acbb97007b89619c711749d4bbc51e365682daaa4f18d0759.4d696c6b6f6d656461466f6f626172',
            policyId: '7312879acbb97007b89619c711749d4bbc51e365682daaa4f18d0759',
            name: '4d696c6b6f6d656461466f6f626172',
          },
          {
            amount: '633',
            assetId: '8c4662efcb7fd069c9e4003192b430e9e153e5c3e11099e3dab29772.4d4152454b',
            policyId: '8c4662efcb7fd069c9e4003192b430e9e153e5c3e11099e3dab29772',
            name: '4d4152454b',
          },
          {
            amount: '1',
            assetId: '9e5f43a9e77e4ba2e5c5db37daee3ee0a78bc87cdea3c34f7f78523c.546f6b656e3131',
            policyId: '9e5f43a9e77e4ba2e5c5db37daee3ee0a78bc87cdea3c34f7f78523c',
            name: '546f6b656e3131',
          },
          {
            amount: '2418889379',
            assetId: 'c85f714f2187021c7bab53741f659d0c5b1a6e7529d32b7794ff051c.474f4c44',
            policyId: 'c85f714f2187021c7bab53741f659d0c5b1a6e7529d32b7794ff051c',
            name: '474f4c44',
          },
          {
            amount: '2463889377',
            assetId: 'c868cdb63090661d815bac251aad5fcffaef94cf099e6cd81df33490.474f4c44',
            policyId: 'c868cdb63090661d815bac251aad5fcffaef94cf099e6cd81df33490',
            name: '474f4c44',
          },
          {
            amount: '100',
            assetId: 'ce3c3f372d4b277c3a583421bda2799a62b5b5105076b03d1e28b07b.53544b443130',
            policyId: 'ce3c3f372d4b277c3a583421bda2799a62b5b5105076b03d1e28b07b',
            name: '53544b443130',
          },
          {
            amount: '30499999987788',
            assetId: 'd27197682d71905c087c5c3b61b10e6d746db0b9bef351014d75bb26.6e69636f696e',
            policyId: 'd27197682d71905c087c5c3b61b10e6d746db0b9bef351014d75bb26',
            name: '6e69636f696e',
          },
          {
            amount: '25867',
            assetId:
              'e4214b7cce62ac6fbba385d164df48e157eae5863521b4b67ca71d86.438bb31d1920ad7fff1e0e93cab8a887eaa0b0c6754f578631f13389c3cdb0cd',
            policyId: 'e4214b7cce62ac6fbba385d164df48e157eae5863521b4b67ca71d86',
            name: '438bb31d1920ad7fff1e0e93cab8a887eaa0b0c6754f578631f13389c3cdb0cd',
          },
          {
            amount: '416592',
            assetId:
              'e4214b7cce62ac6fbba385d164df48e157eae5863521b4b67ca71d86.60a585ee984a47140f7c201f238d48f89585d1a9f42687750626db3a906b050a',
            policyId: 'e4214b7cce62ac6fbba385d164df48e157eae5863521b4b67ca71d86',
            name: '60a585ee984a47140f7c201f238d48f89585d1a9f42687750626db3a906b050a',
          },
          {
            amount: '8613',
            assetId:
              'e4214b7cce62ac6fbba385d164df48e157eae5863521b4b67ca71d86.86e90c911f058c3ebeb95a120eedd311caff3bb49d5b29ff8a9bad42005b041f',
            policyId: 'e4214b7cce62ac6fbba385d164df48e157eae5863521b4b67ca71d86',
            name: '86e90c911f058c3ebeb95a120eedd311caff3bb49d5b29ff8a9bad42005b041f',
          },
          {
            amount: '9',
            assetId: 'ecd07b4ef62f37a68d145de8efd60c53d288dd5ffc641215120cc3db.',
            policyId: 'ecd07b4ef62f37a68d145de8efd60c53d288dd5ffc641215120cc3db',
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
            assetId: '08d91ec4e6c743a92de97d2fde5ca0d81493555c535894a3097061f7.c8b0',
            policyId: '08d91ec4e6c743a92de97d2fde5ca0d81493555c535894a3097061f7',
            name: 'c8b0',
          },
          {
            amount: '1',
            assetId: '0a31cbe14cab7ce93b35cda636bd99ca77130c5ba44cb745af550c68.4e46543135',
            policyId: '0a31cbe14cab7ce93b35cda636bd99ca77130c5ba44cb745af550c68',
            name: '4e46543135',
          },
          {
            amount: '2463889379',
            assetId: '1ca1fc0c880d25850cb00303788dfb51bdf2f902f6dce47d1ad09d5b.44',
            policyId: '1ca1fc0c880d25850cb00303788dfb51bdf2f902f6dce47d1ad09d5b',
            name: '44',
          },
          {
            amount: '5',
            assetId: '1d129dc9c03f95a863489883914f05a52e13135994a32f0cbeacc65f.74484f444c52',
            policyId: '1d129dc9c03f95a863489883914f05a52e13135994a32f0cbeacc65f',
            name: '74484f444c52',
          },
          {
            amount: '215410',
            assetId: '29d222ce763455e3d7a09a665ce554f00ac89d2e99a1a83d267170c6.4d494e',
            policyId: '29d222ce763455e3d7a09a665ce554f00ac89d2e99a1a83d267170c6',
            name: '4d494e',
          },
          {
            amount: '179',
            assetId: '29d222ce763455e3d7a09a665ce554f00ac89d2e99a1a83d267170c6.4d494e74',
            policyId: '29d222ce763455e3d7a09a665ce554f00ac89d2e99a1a83d267170c6',
            name: '4d494e74',
          },
          {
            amount: '93',
            assetId: '3eb82f197734954a140faa953203e2454421832c4b00aff63a62459d.53544b',
            policyId: '3eb82f197734954a140faa953203e2454421832c4b00aff63a62459d',
            name: '53544b',
          },
          {
            amount: '133',
            assetId: '57575a1b17e61ade154b325dceca4c3cfe26b6f98f9b186d08583ada.66697368546f6b656e',
            policyId: '57575a1b17e61ade154b325dceca4c3cfe26b6f98f9b186d08583ada',
            name: '66697368546f6b656e',
          },
          {
            amount: '10840562',
            assetId: '57fca08abbaddee36da742a839f7d83a7e1d2419f1507fcbf3916522.4d494e54',
            policyId: '57fca08abbaddee36da742a839f7d83a7e1d2419f1507fcbf3916522',
            name: '4d494e54',
          },
          {
            amount: '3422266',
            assetId: '57fca08abbaddee36da742a839f7d83a7e1d2419f1507fcbf3916522.534245525259',
            policyId: '57fca08abbaddee36da742a839f7d83a7e1d2419f1507fcbf3916522',
            name: '534245525259',
          },
          {
            amount: '838202298',
            assetId: '698a6ea0ca99f315034072af31eaac6ec11fe8558d3f48e9775aab9d.7444524950',
            policyId: '698a6ea0ca99f315034072af31eaac6ec11fe8558d3f48e9775aab9d',
            name: '7444524950',
          },
          {
            amount: '3',
            assetId: '6b8d07d69639e9413dd637a1a815a7323c69c86abbafb66dbfdb1aa7',
            policyId: '6b8d07d69639e9413dd637a1a815a7323c69c86abbafb66dbfdb1aa7',
            name: '',
          },
          {
            amount: '4999009',
            assetId: '7312879acbb97007b89619c711749d4bbc51e365682daaa4f18d0759.4d696c6b6f6d656461466f6f626172',
            policyId: '7312879acbb97007b89619c711749d4bbc51e365682daaa4f18d0759',
            name: '4d696c6b6f6d656461466f6f626172',
          },
          {
            amount: '633',
            assetId: '8c4662efcb7fd069c9e4003192b430e9e153e5c3e11099e3dab29772.4d4152454b',
            policyId: '8c4662efcb7fd069c9e4003192b430e9e153e5c3e11099e3dab29772',
            name: '4d4152454b',
          },
          {
            amount: '1',
            assetId: '9e5f43a9e77e4ba2e5c5db37daee3ee0a78bc87cdea3c34f7f78523c.546f6b656e3131',
            policyId: '9e5f43a9e77e4ba2e5c5db37daee3ee0a78bc87cdea3c34f7f78523c',
            name: '546f6b656e3131',
          },
          {
            amount: '2418889379',
            assetId: 'c85f714f2187021c7bab53741f659d0c5b1a6e7529d32b7794ff051c.474f4c44',
            policyId: 'c85f714f2187021c7bab53741f659d0c5b1a6e7529d32b7794ff051c',
            name: '474f4c44',
          },
          {
            amount: '2463889377',
            assetId: 'c868cdb63090661d815bac251aad5fcffaef94cf099e6cd81df33490.474f4c44',
            policyId: 'c868cdb63090661d815bac251aad5fcffaef94cf099e6cd81df33490',
            name: '474f4c44',
          },
          {
            amount: '100',
            assetId: 'ce3c3f372d4b277c3a583421bda2799a62b5b5105076b03d1e28b07b.53544b443130',
            policyId: 'ce3c3f372d4b277c3a583421bda2799a62b5b5105076b03d1e28b07b',
            name: '53544b443130',
          },
          {
            amount: '30499999987788',
            assetId: 'd27197682d71905c087c5c3b61b10e6d746db0b9bef351014d75bb26.6e69636f696e',
            policyId: 'd27197682d71905c087c5c3b61b10e6d746db0b9bef351014d75bb26',
            name: '6e69636f696e',
          },
          {
            amount: '25867',
            assetId:
              'e4214b7cce62ac6fbba385d164df48e157eae5863521b4b67ca71d86.438bb31d1920ad7fff1e0e93cab8a887eaa0b0c6754f578631f13389c3cdb0cd',
            policyId: 'e4214b7cce62ac6fbba385d164df48e157eae5863521b4b67ca71d86',
            name: '438bb31d1920ad7fff1e0e93cab8a887eaa0b0c6754f578631f13389c3cdb0cd',
          },
          {
            amount: '416592',
            assetId:
              'e4214b7cce62ac6fbba385d164df48e157eae5863521b4b67ca71d86.60a585ee984a47140f7c201f238d48f89585d1a9f42687750626db3a906b050a',
            policyId: 'e4214b7cce62ac6fbba385d164df48e157eae5863521b4b67ca71d86',
            name: '60a585ee984a47140f7c201f238d48f89585d1a9f42687750626db3a906b050a',
          },
          {
            amount: '8613',
            assetId:
              'e4214b7cce62ac6fbba385d164df48e157eae5863521b4b67ca71d86.86e90c911f058c3ebeb95a120eedd311caff3bb49d5b29ff8a9bad42005b041f',
            policyId: 'e4214b7cce62ac6fbba385d164df48e157eae5863521b4b67ca71d86',
            name: '86e90c911f058c3ebeb95a120eedd311caff3bb49d5b29ff8a9bad42005b041f',
          },
          {
            amount: '9',
            assetId: 'ecd07b4ef62f37a68d145de8efd60c53d288dd5ffc641215120cc3db.',
            policyId: 'ecd07b4ef62f37a68d145de8efd60c53d288dd5ffc641215120cc3db',
            name: '',
          },
        ],
      },
    ],
    lastUpdatedAt: '2022-06-12T23:46:47.000Z',
    submittedAt: '2022-06-12T23:46:47.000Z',
    blockNum: 3626415,
    blockHash: '3be6615c2711f8c85e5777d1a060682bba507551d99d3568569fe8dfb7dcc690',
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
}

export const mockApi = {
  getTipStatus: jest.fn().mockResolvedValue(mockedTipStatusResponse),
  fetchNewTxHistory: jest
    .fn()
    .mockResolvedValueOnce(mockedHistoryResponse)
    .mockResolvedValueOnce(mockedEmptyHistoryResponse)
    .mockResolvedValueOnce(mockedEmptyHistoryResponse),
}
