import {StackNavigationOptions} from '@react-navigation/stack'
import React from 'react'
import {defineMessages, useIntl} from 'react-intl'
import {StyleSheet, TouchableOpacity, TouchableOpacityProps} from 'react-native'

import {Icon} from '../components'
import {SearchBar} from './SearchBar'
import {useSearch} from './SearchContext'

export const useSearchHeaderOptions = () => {
  const strings = useStrings()
  const [searchVisible, setSearchVisible] = React.useState(false)
  const {clearSearch} = useSearch()
  const handleSearchClose = () => {
    setSearchVisible(false)
    clearSearch()
  }

  const searchHeaderOptions: StackNavigationOptions = searchVisible
    ? {
        headerTitleContainerStyle: styles.headerTitleContainer,
        headerTitle: () => <SearchHeader placeholder={strings.search} onClose={handleSearchClose} />,
        headerLeftContainerStyle: styles.disableFlex,
        headerLeft: () => null,
        headerRightContainerStyle: styles.disableFlex,
        headerRight: () => null,
      }
    : {
        headerTitleContainerStyle: styles.headerTitleContainer,
        title: strings.title,
        headerRight: () => <SearchButton onPress={() => setSearchVisible(true)} />,
        headerRightContainerStyle: {
          ...styles.disableFlex,
          paddingHorizontal: 16,
          position: 'absolute',
          right: 0,
          bottom: 0,
          top: 0,
        },
        headerLeftContainerStyle: styles.disableFlex,
        headerLeft: () => null,
      }

  return {searchHeaderOptions}
}

interface Props {
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

const SearchButton = (props: TouchableOpacityProps) => (
  <TouchableOpacity {...props} hitSlop={{top: 100, left: 100, right: 100, bottom: 100}}>
    <Icon.Magnify size={26} />
  </TouchableOpacity>
)

const useStrings = () => {
  const intl = useIntl()

  return {
    title: intl.formatMessage(messages.title),
    search: intl.formatMessage(messages.search),
  }
}

const messages = defineMessages({
  title: {
    id: 'nft.navigation.title',
    defaultMessage: '!!!NFT Gallery',
  },
  search: {
    id: 'nft.navigation.search',
    defaultMessage: '!!!Search NFT',
  },
})

const styles = StyleSheet.create({
  disableFlex: {
    flex: undefined,
    flexGrow: undefined,
    flexBasis: undefined,
    flexShrink: undefined,
  },
  headerTitleContainer: {
    flex: 1,
    marginHorizontal: undefined,
    maxWidth: undefined,
    alignItems: 'center',
  },
})
