import {StackNavigationOptions} from '@react-navigation/stack'
import React from 'react'
import {TextInput, TouchableOpacity, TouchableOpacityProps} from 'react-native'

import {Icon} from '../components'
import {defaultStackNavigationOptionsV2} from '../navigation'
import {useSearch} from './SearchContext'

export const useSearchHeaderOptions = ({
  placeHolderText,
  title,
  noBack = false,
}: {
  placeHolderText: string
  title: string
  noBack?: boolean
}) => {
  const [searchVisible, setSearchVisible] = React.useState(false)
  const {search, clearSearch} = useSearch()
  const handleSearchClose = () => {
    setSearchVisible(false)
    clearSearch()
  }

  const searchHeaderOptions: StackNavigationOptions = searchVisible
    ? {
        ...defaultStackNavigationOptionsV2,
        headerTitle: () => <SearchHeader placeholder={placeHolderText} />,
        headerRight: () => (search.length > 0 ? <EraseButton onPress={clearSearch} /> : null),
        headerLeft: () => <BackButton onPress={handleSearchClose} />,
        headerTitleAlign: 'left',
        headerTitleContainerStyle: {
          flex: 1,
        },
        headerBackTitleVisible: false,
      }
    : {
        ...defaultStackNavigationOptionsV2,
        title: title,
        headerRight: () => <SearchButton onPress={() => setSearchVisible(true)} />,
        ...(noBack ? {headerLeft: () => null} : {}),
        headerBackTitleVisible: false,
      }

  return searchHeaderOptions
}

type Props = {
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
  <TouchableOpacity {...props}>
    <Icon.Magnify size={26} />
  </TouchableOpacity>
)

const EraseButton = (props: TouchableOpacityProps) => (
  <TouchableOpacity {...props}>
    <Icon.Cross size={20} />
  </TouchableOpacity>
)

const BackButton = (props: TouchableOpacityProps) => (
  <TouchableOpacity {...props}>
    <Icon.Chevron direction="left" color="#000000" />
  </TouchableOpacity>
)
