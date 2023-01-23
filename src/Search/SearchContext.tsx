import React, {createContext, ReactNode, useContext, useState} from 'react'

interface SearchContextApi {
  search: string
  setSearch: (search: string) => void
  clearSearch: () => void
  visible: boolean
  setVisible: (visible: boolean) => void
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
  const [search, setSearch] = useState('')
  const [visible, setVisible] = useState(false)
  const clearSearch = () => setSearch('')
  const defaultValue = {search, setSearch, clearSearch, visible, setVisible}
  return <SearchContext.Provider value={{...defaultValue, ...value}}>{children}</SearchContext.Provider>
}
