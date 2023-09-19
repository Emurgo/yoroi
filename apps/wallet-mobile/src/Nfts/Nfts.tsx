import {useFocusEffect} from '@react-navigation/native'
import React, {ReactNode} from 'react'
import {defineMessages, useIntl} from 'react-intl'
import {ScrollView, StyleSheet, Text, View} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'

import {NftImageGallery, Spacer} from '../components'
import {useMetrics} from '../metrics/metricsManager'
import {useSearch, useSearchOnNavBar} from '../Search/SearchContext'
import {useSelectedWallet} from '../SelectedWallet'
import {Balances} from '../yoroi-wallets/portfolio/helpers/balances'
import {useTrackNftGallerySearchActivated} from './filterNfts'
import {useNavigateTo} from './navigation'
import {NoNftsScreen} from './NoNftsScreen'

export const Nfts = () => {
  const navigateTo = useNavigateTo()
  const strings = useStrings()
  const {track} = useMetrics()

  // use case: search nfts
  useSearchOnNavBar({
    title: strings.title,
    placeholder: strings.search,
    noBack: true,
  })

  const wallet = useSelectedWallet()
  const nfts = React.useMemo(() => Balances.filterByNfts(wallet.balances), [wallet.balances])

  useFocusEffect(
    React.useCallback(() => {
      track.nftGalleryPageViewed({nft_count: nfts.length})
    }, [nfts.length, track]),
  )

  const {search: nftsSearchTerm} = useSearch()
  const nftsSearchResult = Balances.filterByName(nfts, nftsSearchTerm)
  useTrackNftGallerySearchActivated(nftsSearchTerm, nftsSearchResult.length)

  const hasEmptySearchResult = nftsSearchTerm.length > 0 && nftsSearchResult.length === 0
  const hasNotNfts = nftsSearchResult.length === 0

  if (hasEmptySearchResult) {
    return (
      <Wrapper>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollViewError}
        >
          <NoNftsScreen message={strings.noNftsFound} />
        </ScrollView>
      </Wrapper>
    )
  }

  if (hasNotNfts) {
    return (
      <Wrapper>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollViewError}
        >
          <NoNftsScreen
            message={strings.noNftsInWallet}
            heading={
              <View>
                <NftCount count={0} />

                <Spacer height={16} />
              </View>
            }
          />
        </ScrollView>
      </Wrapper>
    )
  }

  return (
    <Wrapper>
      <View style={styles.galleryContainer}>
        {nftsSearchTerm.length === 0 && (
          <>
            <NftCount count={nftsSearchResult.length} />

            <Spacer height={16} />
          </>
        )}

        <NftImageGallery
          nfts={nftsSearchResult}
          onSelect={navigateTo.nftDetails}
        />
      </View>
    </Wrapper>
  )
}

const Wrapper = ({children}: {children: ReactNode}) => {
  return (
    <SafeAreaView edges={['left', 'right', 'bottom']} style={styles.safeAreaView}>
      <View style={styles.container}>
        <Spacer height={16} />

        {children}
      </View>
    </SafeAreaView>
  )
}

const NftCount = ({count}: {count?: number | string}) => {
  const strings = useStrings()

  return (
    <View style={styles.countBar} testID="txtNftCount">
      <Text style={styles.count}>{`${strings.nftCount}: ${count ?? '-'}`}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  safeAreaView: {
    flex: 1,
    backgroundColor: 'white',
  },
  container: {
    flexDirection: 'column',
    flex: 1,
  },
  scrollView: {
    flex: 1,
    flexGrow: 1,
  },
  scrollViewError: {
    flex: 1,
  },

  countBar: {
    height: 22,
  },
  count: {
    flex: 1,
    textAlign: 'center',
    color: '#6B7384',
  },


  galleryContainer: {
    flex: 1,
    flexGrow: 1,
  },
})

const messages = defineMessages({
  nftCount: {
    id: 'nft.gallery.nftCount',
    defaultMessage: '!!!NFT count',
  },
  errorTitle: {
    id: 'nft.gallery.errorTitle',
    defaultMessage: '!!!Oops!',
  },
  errorDescription: {
    id: 'nft.gallery.errorDescription',
    defaultMessage: '!!!Something went wrong.',
  },
  reloadApp: {
    id: 'nft.gallery.reloadApp',
    defaultMessage: '!!!Try to restart the app.',
  },
  noNftsFound: {
    id: 'nft.gallery.noNftsFound',
    defaultMessage: '!!!No NFTs found',
  },
  noNftsInWallet: {
    id: 'nft.gallery.noNftsInWallet',
    defaultMessage: '!!!No NFTs added to your wallet yet',
  },
  title: {
    id: 'nft.navigation.title',
    defaultMessage: '!!!NFT Gallery',
  },
  search: {
    id: 'nft.navigation.search',
    defaultMessage: '!!!Search NFT',
  },
})

const useStrings = () => {
  const intl = useIntl()

  return {
    title: intl.formatMessage(messages.title),
    search: intl.formatMessage(messages.search),
    nftCount: intl.formatMessage(messages.nftCount),
    errorTitle: intl.formatMessage(messages.errorTitle),
    errorDescription: intl.formatMessage(messages.errorDescription),
    reloadApp: intl.formatMessage(messages.reloadApp),
    noNftsFound: intl.formatMessage(messages.noNftsFound),
    noNftsInWallet: intl.formatMessage(messages.noNftsInWallet),
  }
}
