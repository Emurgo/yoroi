import * as React from 'react'

import {portfolioManagerMaker} from '../portfolio-manager'
import {mocksPortolioManager} from '../portfolio-manager.mocks'
import {PortfolioManager} from '../types'
import {
  defaultPortfolioActions,
  defaultPortfolioState,
  PortfolioActions,
  PortfolioActionType,
  portfolioReducer,
  PortfolioState,
} from './portfolio-state'

const defaultPortfolioManager: PortfolioManager = portfolioManagerMaker(
  mocksPortolioManager.mockPortfolioManagerOptionsError,
)
export type PortfolioProviderContext = React.PropsWithChildren<PortfolioState & PortfolioActions & PortfolioManager>
const initialPortfolioProvider: PortfolioProviderContext = {
  ...defaultPortfolioState,
  ...defaultPortfolioActions,
  ...defaultPortfolioManager,
} as const

const PortfolioContext = React.createContext<PortfolioProviderContext>(initialPortfolioProvider)

export const PortfolioProvider = ({
  children,
  portfolioManager,
  initialState,
}: {
  children: React.ReactNode
  portfolioManager: PortfolioManager
  initialState?: Readonly<Partial<PortfolioState>>
}) => {
  const [state, dispatch] = React.useReducer(portfolioReducer, {
    ...defaultPortfolioState,
    ...initialState,
  })
  const actions = React.useRef<PortfolioActions>({
    primaryAmountsChanged: (amounts: Readonly<PortfolioState['primary']['amounts']>) => {
      dispatch({type: PortfolioActionType.PrimaryAmountsChanged, amounts})
    },
    primaryTokensChanged: (primaryTokens: Readonly<PortfolioState['primary']['tokens']>) => {
      dispatch({type: PortfolioActionType.PrimaryTokensChanged, primaryTokens})
    },
    primaryCommittedChanged: (amounts: Readonly<PortfolioState['primary']['committed']>) => {
      dispatch({type: PortfolioActionType.PrimaryCommittedChanged, amounts})
    },
    primaryLockedChanged: (amounts: Readonly<PortfolioState['primary']['locked']>) => {
      dispatch({type: PortfolioActionType.PrimaryLockedChanged, amounts})
    },
    secondaryChanged: (secondary: Readonly<PortfolioState['secondary']>) => {
      dispatch({type: PortfolioActionType.SecondaryChanged, secondary})
    },
    primaryChanged: (primary: Readonly<PortfolioState['primary']>) => {
      dispatch({type: PortfolioActionType.PrimaryChanged, primary})
    },
    resetState: (state: Readonly<PortfolioState>) => {
      dispatch({type: PortfolioActionType.ResetState, state})
    },
  }).current

  const context = React.useMemo(() => ({...state, ...actions, ...portfolioManager}), [state, actions, portfolioManager])

  return <PortfolioContext.Provider value={context}>{children}</PortfolioContext.Provider>
}

export const usePortfolio = () => React.useContext(PortfolioContext)

// export const usePortfolioUpdate = (
//   options: UseMutationOptions<void, Error, {amounts: Balance.Amounts; avoidCache: boolean}> = {},
// ) => {
//   const {update} = usePortfolio()
//   const mutation = useMutation({
//     mutationFn: update,
//     ...options,
//   })

//   return {
//     tokensCacheUpdate: mutation.mutate,
//     ...mutation,
//   }
// }
