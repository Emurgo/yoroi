import React from 'react'

import {SearchBar} from './SearchBar'
import {useSearch} from './SearchContext'

export interface Props {
  placeholder: string
}

export const SearchHeader = (props: Props) => {
  const {search, setSearch, clearSearch, setVisible, visible} = useSearch()
  if (!visible) return null
  return (
    <SearchBar
      placeholder={props.placeholder}
      onChangeText={(search) => setSearch(search)}
      value={search}
      onClearPress={clearSearch}
      onBackPress={() => setVisible(false)}
    />
  )
}
