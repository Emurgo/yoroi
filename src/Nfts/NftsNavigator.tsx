import {createStackNavigator} from '@react-navigation/stack'
import React from 'react'
import {defineMessages, useIntl} from 'react-intl'

import {NftRoutes} from '../navigation'
import {SearchProvider} from '../Search'
import {useSearchHeader} from '../Search/SearchHeader'
import {useSelectedWallet} from '../SelectedWallet'
import {useNfts} from '../yoroi-wallets'
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
  const wallet = useSelectedWallet()
  const {nfts} = useNfts(wallet)
  const {searchHeaderOptions, searchResult, searchTerm} = useSearchHeader({
    target: nfts,
    searchBy: 'name',
    placeHolderText: strings.search,
    title: strings.title,
  })

  return (
    <Stack.Navigator>
      <Stack.Screen name="nft-gallery" options={searchHeaderOptions}>
        {() => <Nfts nftsSearchResult={searchResult} nftsSearchTerm={searchTerm} />}
      </Stack.Screen>
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
