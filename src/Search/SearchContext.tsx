import React, {createContext, ReactNode, useContext, useReducer} from 'react'

type SearchState = {
  search: string
}
type SearchActions = {
  searchChanged: (search: string) => void
  clearSearch: () => void
}

const SearchContext = createContext<undefined | (SearchState & SearchActions)>(undefined)

export const useSearch = () => {
  const value = useContext(SearchContext)
  if (!value) {
    throw new Error('useSearch must be used within a SearchProvider')
  }
  return value
}

export const SearchProvider = ({
  children,
  initialState,
}: {
  children: ReactNode
  initialState?: Partial<SearchState>
}) => {
  const [state, dispatch] = useReducer(searchReducer, {...defaultState, ...initialState})
  const actions = React.useRef<SearchActions>({
    clearSearch: () => dispatch({type: 'clear'}),
    searchChanged: (search: string) => dispatch({type: 'searchChanged', search}),
  }).current

  const context = React.useMemo(() => ({...state, ...actions}), [state, actions])

  return <SearchContext.Provider value={context}>{children}</SearchContext.Provider>
}

type SearchAction = {type: 'clear'} | {type: 'searchChanged'; search: string}

function searchReducer(state: SearchState, action: SearchAction) {
  switch (action.type) {
    case 'clear':
      return {...state, search: ''}

    case 'searchChanged':
      return {
        ...state,
        search: action.search,
      }

    default:
      throw new Error(`searchReducer invalid action`)
  }
}

const defaultState: SearchState = Object.freeze({search: ''})
