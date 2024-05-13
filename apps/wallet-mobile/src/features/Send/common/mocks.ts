import {tokenBalanceMocks, tokenMocks} from '@yoroi/portfolio'
import {defaultTransferState} from '@yoroi/transfer'

import {mocks as walletMocks} from '../../../yoroi-wallets/mocks/wallet'

export const mocks = {
  startTx: {
    error: {
      invalidAddress: {
        ...defaultTransferState,
        targets: [
          {
            ...defaultTransferState.targets[0],
            receiver: {
              ...defaultTransferState.targets[0].receiver,
              receiver: 'invalid_address',
            },
            entry: {
              ...defaultTransferState.targets[0].entry,
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
              ...defaultTransferState.targets[0].entry,
            },
          },
        ],
      },
    },
  },
  editingAmount: {
    adding: {
      ...defaultTransferState,
      selectedTokenId: tokenBalanceMocks.primaryETH.info.id,
      targets: [
        {
          ...defaultTransferState.targets[0],
          entry: {
            ...defaultTransferState.targets[0].entry,
            amounts: {
              [tokenMocks.primaryETH.info.id]: {
                ...tokenMocks.primaryETH.balance,
                quantity: 0n,
              },
            },
          },
        },
      ],
    },
    initialQuantity: {
      ...defaultTransferState,
      selectedTokenId: tokenBalanceMocks.primaryETH.info.id,
      targets: [
        {
          ...defaultTransferState.targets[0],
          entry: {
            ...defaultTransferState.targets[0].entry,
            amounts: {
              [tokenMocks.primaryETH.info.id]: tokenMocks.primaryETH.balance,
            },
          },
        },
      ],
    },
    insuficientBalance: {
      ...defaultTransferState,
      selectedTokenId: tokenMocks.nftCryptoKitty.info.id,
      targets: [
        {
          ...defaultTransferState.targets[0],
          entry: {
            ...defaultTransferState.targets[0].entry,
            amounts: {
              [tokenMocks.nftCryptoKitty.info.id]: tokenMocks.nftCryptoKitty.balance,
            },
          },
        },
      ],
    },
    secondaryToken: {
      ...defaultTransferState,
      selectedTokenId: tokenMocks.nftCryptoKitty.info.id,
      targets: [
        {
          ...defaultTransferState.targets[0],
          entry: {
            ...defaultTransferState.targets[0].entry,
            amounts: {
              [tokenMocks.nftCryptoKitty.info.id]: tokenMocks.nftCryptoKitty.balance,
            },
          },
        },
      ],
    },
    overSpendable: {
      ...defaultTransferState,
      selectedTokenId: tokenBalanceMocks.primaryETH.info.id,
      targets: [
        {
          ...defaultTransferState.targets[0],
          entry: {
            ...defaultTransferState.targets[0].entry,
            amounts: {
              [tokenMocks.primaryETH.info.id]: {
                ...tokenMocks.primaryETH.balance,
                quantity: 1_000_000_000_000_000n,
              },
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
      selectedTokenId: tokenBalanceMocks.primaryETH.info.id,
      targets: [
        {
          ...defaultTransferState.targets[0],
          entry: {
            ...defaultTransferState.targets[0].entry,
            amounts: {
              [tokenMocks.primaryETH.info.id]: tokenMocks.primaryETH.balance,
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
            ...defaultTransferState.targets[0].entry,
            amounts: {
              [tokenMocks.primaryETH.info.id]: tokenMocks.primaryETH.balance,
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
            ...defaultTransferState.targets[0].entry,
            amounts: tokenBalanceMocks.storage.entries1,
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
            ...defaultTransferState.targets[0].entry,
            amounts: tokenBalanceMocks.storage.entries1WithPrimary,
          },
        },
      ],
    },
  },
}
