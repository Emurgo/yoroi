import {freeze} from 'immer'

import {PortfolioStorage} from '../../types'

export const portfolioStorageMock: PortfolioStorage = freeze(
  {
    clear: () => {},
    balances: {
      read: (..._args) => [],
      save: (..._args) => {},
      all: () => [],
      clear: () => {},
      keys: () => [],
    },
    primaryBalanceBreakdown: {
      read: (..._args) => null,
      save: (..._args) => {},
      clear: () => {},
    },
    token: {
      discoveries: {
        read: (..._args) => [],
        save: (..._args) => {},
        all: () => [],
        clear: () => {},
        keys: () => [],
      },
      infos: {
        read: (..._args) => [],
        save: (..._args) => {},
        all: () => [],
        clear: () => {},
        keys: () => [],
      },
    },
  },
  true,
)
