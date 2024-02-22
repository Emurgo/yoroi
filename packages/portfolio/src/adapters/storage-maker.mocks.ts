import {freeze} from 'immer'

import {PortfolioStorage} from '../types'

export const portfolioStorageMock: PortfolioStorage = freeze(
  {
    clear: () => {},
    token: {
      discoveries: {
        read: (..._args) => [],
        save: (..._args) => {},
      },
      infos: {
        read: (..._args) => [],
        save: (..._args) => {},
      },
    },
  },
  true,
)
