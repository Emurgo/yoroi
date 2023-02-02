import React, {createContext, ReactNode, useContext, useReducer} from 'react'

interface SearchContextApi {
  search: string
  setSearch: (search: string) => void
  clearSearch: () => void
}

const SearchContext = createContext<SearchContextApi | null>(null)

export const useSearch = () => {
  const value = useContext(SearchContext)
  if (!value) {
    throw new Error('useSearch must be used within a SearchProvider')
  }
  return value
}

export const SearchProvider = ({children, value}: {children: ReactNode; value?: Partial<SearchContextApi>}) => {
  const [search, dispatch] = useReducer(searchReducer, DEFAULT_SEARCH_VALUE)
  const clearSearch = () => dispatch({type: 'CLEAR'})
  const setSearch = (search: string) => dispatch({type: 'SET', payload: search})
  const defaultValue = {search, setSearch, clearSearch}
  return <SearchContext.Provider value={{...defaultValue, ...value}}>{children}</SearchContext.Provider>
}

type ClearSearchAction = {
  type: 'CLEAR'
}

type SetSearchAction = {
  type: 'SET'
  payload: string
}

type SearchAction = ClearSearchAction | SetSearchAction

function searchReducer(state: string, action: SearchAction) {
  switch (action.type) {
    case 'CLEAR':
      return DEFAULT_SEARCH_VALUE
    case 'SET':
      return action.payload
    default:
      return state
  }
}

const DEFAULT_SEARCH_VALUE = ''
