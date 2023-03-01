import React from 'react'

import {SearchBar} from './SearchBar'
import {useSearch} from './SearchContext'

export interface Props {
  placeholder: string
  onClose?(): void
}

export const SearchHeader = ({placeholder, onClose}: Props) => {
  const {search, searchChanged, clearSearch} = useSearch()
  
  return (
    <SearchBar
      placeholder={placeholder}
      onChangeText={(search) => searchChanged(search)}
      value={search}
      onClearPress={clearSearch}
      onBackPress={onClose}
    />
  )
}
