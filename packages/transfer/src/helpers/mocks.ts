import {defaultTransferState} from '../translators/reactjs/state/state'

const secondaryTokenId =
  '698a6ea0ca99f315034072af31eaac6ec11fe8558d3f48e9775aab9d.7444524950'
const secondaryAmount = '12345'
const primaryAmount = '3214'
export const mocks = {
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
      selectedTokenId: walletMocks.wallet.primaryTokenInfo.id,
      targets: [
        {
          ...defaultTransferState.targets[0],
          entry: {
            ...defaultTransferState.targets[0]?.entry,
            amounts: {
              [walletMocks.wallet.primaryTokenInfo.id]: Quantities.zero,
            },
          },
        },
      ],
    },
    initialQuantity: {
      ...defaultTransferState,
      selectedTokenId: walletMocks.wallet.primaryTokenInfo.id,
      targets: [
        {
          ...defaultTransferState.targets[0],
          entry: {
            ...defaultTransferState.targets[0]?.entry,
            amounts: {
              '': asQuantity(50000),
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
              [secondaryTokenId]: Quantities.sum([
                secondaryAmount.quantity,
                asQuantity(1000),
              ]),
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
              [secondaryTokenId]: secondaryAmount.quantity,
            },
          },
        },
      ],
    },
    overSpendable: {
      ...defaultTransferState,
      selectedTokenId: walletMocks.wallet.primaryTokenInfo.id,
      targets: [
        {
          ...defaultTransferState.targets[0],
          entry: {
            ...defaultTransferState.targets[0]?.entry,
            amounts: {
              [walletMocks.wallet.primaryTokenInfo.id]: Quantities.sum([
                primaryAmount.quantity,
                asQuantity(1000),
              ]),
            },
          },
        },
      ],
    },
  },
  confirmTx: {
    success: {
      ...defaultTransferState,
      yoroiUnsignedTx: walletMocks.yoroiUnsignedTx,
      selectedTokenId: walletMocks.wallet.primaryTokenInfo.id,
      targets: [
        {
          ...defaultTransferState.targets[0],
          entry: {
            ...defaultTransferState.targets[0]?.entry,
            amounts: {
              [walletMocks.wallet.primaryTokenInfo.id]: asQuantity(
                walletMocks.yoroiUnsignedTx.entries[0].amounts[
                  walletMocks.wallet.primaryTokenInfo.id
                ],
              ),
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
              [walletMocks.wallet.primaryTokenInfo.id]: asQuantity(50000),
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
              [secondaryTokenId]: asQuantity(1),
              ['other.01']: asQuantity(2),
              ['another.02']: asQuantity(3),
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
              [secondaryTokenId]: asQuantity(1),
              ['other.01']: asQuantity(2),
              ['another.02']: asQuantity(3),
              ['more.03']: asQuantity(4),
              [walletMocks.wallet.primaryTokenInfo.id]: asQuantity(50000),
            },
          },
        },
      ],
    },
  },
}
