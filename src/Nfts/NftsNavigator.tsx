import {createStackNavigator, StackNavigationOptions} from '@react-navigation/stack'
import React, {useState} from 'react'
import {defineMessages, useIntl} from 'react-intl'
import {StyleSheet, TouchableOpacity, TouchableOpacityProps} from 'react-native'

import {Icon} from '../components'
import {NftRoutes} from '../navigation'
import {SearchHeader, SearchProvider, useSearch} from '../Search'
import {Nfts} from './Nfts'

const Stack = createStackNavigator<NftRoutes>()

export const NftsNavigator = () => {
  return (
    <SearchProvider>
      <Routes />
    </SearchProvider>
  )
}

const Routes = () => {
  const strings = useStrings()
  const [searchVisible, setSearchVisible] = useState(false)
  const {clearSearch} = useSearch()
  const handleSearchClose = () => {
    setSearchVisible(false)
    clearSearch()
  }

  const nftGalleryHeaderOptions: StackNavigationOptions = searchVisible
    ? {
        headerTitleContainerStyle: styles.headerTitleContainer,
        headerTitle: () => <SearchHeader placeholder={strings.search} onClose={handleSearchClose} />,
        ...headerDisableLeft,
        ...headerDisableRight,
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
        ...headerDisableLeft,
      }

  return (
    <Stack.Navigator>
      <Stack.Screen name="nft-gallery" component={Nfts} options={nftGalleryHeaderOptions} />
    </Stack.Navigator>
  )
}

const SearchButton = (props: TouchableOpacityProps) => (
  <TouchableOpacity {...props} hitSlop={{top: 100, left: 100, right: 100, bottom: 100}}>
    <Icon.Magnify size={26} />
  </TouchableOpacity>
)

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

const headerDisableLeft: StackNavigationOptions = {
  headerLeftContainerStyle: styles.disableFlex,
  headerLeft: () => null,
}

const headerDisableRight: StackNavigationOptions = {
  headerRightContainerStyle: styles.disableFlex,
  headerRight: () => null,
}

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
