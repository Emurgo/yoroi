import {StackNavigationOptions} from '@react-navigation/stack'
import React from 'react'
import {TextInput, TouchableOpacity, TouchableOpacityProps} from 'react-native'

import {Icon} from '../components'
import {defaultStackNavigationOptionsV2} from '../navigation'
import {useSearch} from './SearchContext'

export const useSearchHeaderOptions = ({placeHolderText, title}) => {
  const [searchVisible, setSearchVisible] = React.useState(false)
  const {clearSearch} = useSearch()
  const handleSearchClose = () => {
    setSearchVisible(false)
    clearSearch()
  }

  const searchHeaderOptions: StackNavigationOptions = searchVisible
    ? {
        ...defaultStackNavigationOptionsV2,
        headerTitle: () => <SearchHeader placeholder={placeHolderText} />,
        headerRight: () => <CloseButton onPress={handleSearchClose} />,
        headerTitleContainerStyle: {
          flex: 1,
        },
        headerTitleAlign: 'left',
        headerBackTitleVisible: false,
      }
    : {
        ...defaultStackNavigationOptionsV2,
        title: title,
        headerRight: () => <SearchButton onPress={() => setSearchVisible(true)} />,
        headerBackTitleVisible: false,
      }

  return {searchHeaderOptions}
}

interface Props {
  placeholder: string
}

export const SearchHeader = ({placeholder}: Props) => {
  const {search, searchChanged} = useSearch()

  return (
    <TextInput
      autoFocus
      value={search}
      placeholder={placeholder}
      onChangeText={(search) => searchChanged(search)}
      style={{flex: 1}}
    />
  )
}

const SearchButton = (props: TouchableOpacityProps) => (
  <TouchableOpacity {...props} hitSlop={{top: 100, left: 100, right: 100, bottom: 100}}>
    <Icon.Magnify size={26} />
  </TouchableOpacity>
)

const CloseButton = (props: TouchableOpacityProps) => (
  <TouchableOpacity {...props} hitSlop={{top: 100, left: 100, right: 100, bottom: 100}}>
    <Icon.Cross size={20} />
  </TouchableOpacity>
)
