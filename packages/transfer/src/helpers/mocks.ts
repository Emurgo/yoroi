/* istanbul ignore file */
import {defaultTransferState} from '../translators/reactjs/state/state'

const secondaryTokenId =
  '698a6ea0ca99f315034072af31eaac6ec11fe8558d3f48e9775aab9d.7444524950'

export const mocks = Object.freeze({
  startTx: {
    error: {
      invalidAddress: {
        ...defaultTransferState,
        targets: [
          {
            ...defaultTransferState.targets[0],
            receiver: {
              ...defaultTransferState.targets[0]?.receiver,
              receiver: 'invalid_address',
            },
            entry: {
              ...defaultTransferState.targets[0]?.entry,
              address: 'invalid_address',
            },
          },
        ],
      },
      memoTooLong: {
        ...defaultTransferState,
        memo: new Array(500).fill('a').join(''),
      },
    },
    loading: {
      resolveReceiver: {
        ...defaultTransferState,
        targets: [
          {
            ...defaultTransferState.targets[0],
            entry: {
              ...defaultTransferState.targets[0]?.entry,
            },
          },
        ],
      },
    },
  },
  editingAmount: {
    adding: {
      ...defaultTransferState,
      selectedTokenId: '',
      targets: [
        {
          ...defaultTransferState.targets[0],
          entry: {
            ...defaultTransferState.targets[0]?.entry,
            amounts: {
              '': '0',
            },
          },
        },
      ],
    },
    initialQuantity: {
      ...defaultTransferState,
      selectedTokenId: '',
      targets: [
        {
          ...defaultTransferState.targets[0],
          entry: {
            ...defaultTransferState.targets[0]?.entry,
            amounts: {
              '': '50000',
            },
          },
        },
      ],
    },
    insuficientBalance: {
      ...defaultTransferState,
      selectedTokenId: secondaryTokenId,
      targets: [
        {
          ...defaultTransferState.targets[0],
          entry: {
            ...defaultTransferState.targets[0]?.entry,
            amounts: {
              [secondaryTokenId]: '12344',
            },
          },
        },
      ],
    },
    secondaryToken: {
      ...defaultTransferState,
      selectedTokenId: secondaryTokenId,
      targets: [
        {
          ...defaultTransferState.targets[0],
          entry: {
            ...defaultTransferState.targets[0]?.entry,
            amounts: {
              [secondaryTokenId]: '12344',
            },
          },
        },
      ],
    },
    overSpendable: {
      ...defaultTransferState,
      selectedTokenId: '',
      targets: [
        {
          ...defaultTransferState.targets[0],
          entry: {
            ...defaultTransferState.targets[0]?.entry,
            amounts: {
              '': '2727363744849',
            },
          },
        },
      ],
    },
  },
  confirmTx: {
    success: {
      ...defaultTransferState,
      yoroiUnsignedTx: {
        entries: [
          {
            address: 'address1',
            amounts: {
              '': '99999',
            },
          },
        ],
        fee: {
          '': '12345',
        },
        metadata: {},
        change: [
          {
            address: 'change_address',
            amounts: {
              '': '1',
            },
          },
        ],
        staking: {
          registrations: [],
          deregistrations: [],
          delegations: [],
          withdrawals: [],
        },
        voting: {},
        unsignedTx: {},
        mock: true,
        governance: false,
      },
      selectedTokenId: '',
      targets: [
        {
          ...defaultTransferState.targets[0],
          entry: {
            ...defaultTransferState.targets[0]?.entry,
            amounts: {
              '': '99999',
            },
          },
        },
      ],
    },
  },
  counters: {
    onlyPrimary: {
      ...defaultTransferState,
      targets: [
        {
          ...defaultTransferState.targets[0],
          entry: {
            ...defaultTransferState.targets[0]?.entry,
            amounts: {
              '': '50000',
            },
          },
        },
      ],
    },
    onlySecondary: {
      ...defaultTransferState,
      targets: [
        {
          ...defaultTransferState.targets[0],
          entry: {
            ...defaultTransferState.targets[0]?.entry,
            amounts: {
              [secondaryTokenId]: '1',
              ['other.01']: '2',
              ['another.02']: '3',
            },
          },
        },
      ],
    },
    both: {
      ...defaultTransferState,
      targets: [
        {
          ...defaultTransferState.targets[0],
          entry: {
            ...defaultTransferState.targets[0]?.entry,
            amounts: {
              [secondaryTokenId]: '1',
              ['other.01']: '2',
              ['another.02']: '3',
              ['more.03']: '4',
              '': '50000',
            },
          },
        },
      ],
    },
  },
})
