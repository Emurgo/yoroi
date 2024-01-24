import {mocks as walletMocks} from '../../../yoroi-wallets/mocks/wallet'
import {Amounts, asQuantity, Quantities} from '../../../yoroi-wallets/utils'
import {initialState} from './SendContext'

const secondaryTokenId = '698a6ea0ca99f315034072af31eaac6ec11fe8558d3f48e9775aab9d.7444524950'
const secondaryAmount = Amounts.getAmount(walletMocks.balances, secondaryTokenId)
const primaryAmount = Amounts.getAmount(walletMocks.balances, walletMocks.wallet.primaryTokenInfo.id)
export const mocks = {
  startTx: {
    error: {
      invalidAddress: {
        ...initialState,
        targets: [
          {
            ...initialState.targets[0],
            receiver: {
              ...initialState.targets[0].receiver,
              receiver: 'invalid_address',
            },
            entry: {
              ...initialState.targets[0].entry,
              address: 'invalid_address',
            },
          },
        ],
      },
      memoTooLong: {
        ...initialState,
        memo: new Array(500).fill('a').join(''),
      },
    },
    loading: {
      resolveReceiver: {
        ...initialState,
        targets: [
          {
            ...initialState.targets[0],
            entry: {
              ...initialState.targets[0].entry,
            },
          },
        ],
      },
    },
  },
  editingAmount: {
    adding: {
      ...initialState,
      selectedTokenId: walletMocks.wallet.primaryTokenInfo.id,
      targets: [
        {
          ...initialState.targets[0],
          entry: {
            ...initialState.targets[0].entry,
            amounts: {
              [walletMocks.wallet.primaryTokenInfo.id]: Quantities.zero,
            },
          },
        },
      ],
    },
    initialQuantity: {
      ...initialState,
      selectedTokenId: walletMocks.wallet.primaryTokenInfo.id,
      targets: [
        {
          ...initialState.targets[0],
          entry: {
            ...initialState.targets[0].entry,
            amounts: {
              [walletMocks.wallet.primaryTokenInfo.id]: asQuantity(50000),
            },
          },
        },
      ],
    },
    insuficientBalance: {
      ...initialState,
      selectedTokenId: secondaryTokenId,
      targets: [
        {
          ...initialState.targets[0],
          entry: {
            ...initialState.targets[0].entry,
            amounts: {
              [secondaryTokenId]: Quantities.sum([secondaryAmount.quantity, asQuantity(1000)]),
            },
          },
        },
      ],
    },
    secondaryToken: {
      ...initialState,
      selectedTokenId: secondaryTokenId,
      targets: [
        {
          ...initialState.targets[0],
          entry: {
            ...initialState.targets[0].entry,
            amounts: {
              [secondaryTokenId]: secondaryAmount.quantity,
            },
          },
        },
      ],
    },
    overSpendable: {
      ...initialState,
      selectedTokenId: walletMocks.wallet.primaryTokenInfo.id,
      targets: [
        {
          ...initialState.targets[0],
          entry: {
            ...initialState.targets[0].entry,
            amounts: {
              [walletMocks.wallet.primaryTokenInfo.id]: Quantities.sum([primaryAmount.quantity, asQuantity(1000)]),
            },
          },
        },
      ],
    },
  },
  confirmTx: {
    success: {
      ...initialState,
      yoroiUnsignedTx: walletMocks.yoroiUnsignedTx,
      selectedTokenId: walletMocks.wallet.primaryTokenInfo.id,
      targets: [
        {
          ...initialState.targets[0],
          entry: {
            ...initialState.targets[0].entry,
            amounts: {
              [walletMocks.wallet.primaryTokenInfo.id]: asQuantity(
                walletMocks.yoroiUnsignedTx.entries[0].amounts[walletMocks.wallet.primaryTokenInfo.id],
              ),
            },
          },
        },
      ],
    },
  },
  counters: {
    onlyPrimary: {
      ...initialState,
      targets: [
        {
          ...initialState.targets[0],
          entry: {
            ...initialState.targets[0].entry,
            amounts: {
              [walletMocks.wallet.primaryTokenInfo.id]: asQuantity(50000),
            },
          },
        },
      ],
    },
    onlySecondary: {
      ...initialState,
      targets: [
        {
          ...initialState.targets[0],
          entry: {
            ...initialState.targets[0].entry,
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
      ...initialState,
      targets: [
        {
          ...initialState.targets[0],
          entry: {
            ...initialState.targets[0].entry,
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
