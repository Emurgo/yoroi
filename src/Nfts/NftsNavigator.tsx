import {createStackNavigator} from '@react-navigation/stack'
import React from 'react'
import {defineMessages, useIntl} from 'react-intl'

import {NftRoutes} from '../navigation'
import {SearchProvider} from '../Search'
import {useSearchHeaderOptions} from '../Search/SearchHeader'
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
const {searchHeaderOptions} = useSearchHeaderOptions({
    placeHolderText: strings.search,
    title: strings.title,
  })

  return (
    <Stack.Navigator>
      <Stack.Screen name="nft-gallery" component={Nfts} options={searchHeaderOptions} />
    </Stack.Navigator>
  )
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
