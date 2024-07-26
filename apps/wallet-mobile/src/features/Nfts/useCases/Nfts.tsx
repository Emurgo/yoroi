import {useFocusEffect} from '@react-navigation/native'
import {infoFilterByName} from '@yoroi/portfolio'
import {useTheme} from '@yoroi/theme'
import {Portfolio} from '@yoroi/types'
import React, {ReactNode} from 'react'
import {defineMessages, useIntl} from 'react-intl'
import {ScrollView, StyleSheet, Text, View} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'

import {Spacer} from '../../../components'
import {useMetrics} from '../../../kernel/metrics/metricsManager'
import {usePortfolioBalances} from '../../Portfolio/common/hooks/usePortfolioBalances'
import {MediaGallery} from '../../Portfolio/common/MediaGallery/MediaGallery'
import {useSearch, useSearchOnNavBar} from '../../Search/SearchContext'
import {NetworkTag} from '../../Settings/ChangeNetwork/NetworkTag'
import {useSelectedWallet} from '../../WalletManager/common/hooks/useSelectedWallet'
import {useTrackNftGallerySearchActivated} from '../common/filterNfts'
import {useNavigateTo} from '../common/navigation'
import {NoNftsScreen} from './NoNftsScreen'

export const Nfts = () => {
  const navigateTo = useNavigateTo()
  const strings = useStrings()
  const styles = useStyles()
  const {track} = useMetrics()

  const {wallet} = useSelectedWallet()
  const balances = usePortfolioBalances({wallet})

  // use case: search nfts
  useSearchOnNavBar({
    title: strings.title,
    placeholder: strings.search,
    extraNavigationOptions: {headerTitle: ({children}) => <NetworkTag>{children}</NetworkTag>},
  })
  const {search, isSearching} = useSearch()

  const filteredAmounts = React.useMemo(() => {
    const byName = infoFilterByName(search)
    return isSearching ? balances.nfts.filter(({info}) => byName(info)) : balances.nfts
  }, [balances.nfts, isSearching, search])

  useFocusEffect(
    React.useCallback(() => {
      track.nftGalleryPageViewed({nft_count: balances.nfts.length})
    }, [balances.nfts.length, track]),
  )

  useTrackNftGallerySearchActivated(search, filteredAmounts.length)

  const hasEmptySearchResult = isSearching && filteredAmounts.length === 0
  const hasNotNfts = balances.nfts.length === 0

  if (hasEmptySearchResult) {
    return (
      <Wrapper>
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollViewError}>
          <NoNftsScreen message={strings.noNftsFound} />
        </ScrollView>
      </Wrapper>
    )
  }

  if (hasNotNfts) {
    return (
      <Wrapper>
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollViewError}>
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
        {isSearching && (
          <>
            <NftCount count={filteredAmounts.length} />

            <Spacer height={16} />
          </>
        )}

        <MediaGallery
          amounts={filteredAmounts}
          onSelect={(amount: Portfolio.Token.Amount) => navigateTo.nftDetails(amount.info.id)}
        />
      </View>
    </Wrapper>
  )
}

const Wrapper = ({children}: {children: ReactNode}) => {
  const styles = useStyles()
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
  const styles = useStyles()

  return (
    <View style={styles.countBar} testID="txtNftCount">
      <Text style={styles.count}>{`${strings.nftCount}: ${count ?? '-'}`}</Text>
    </View>
  )
}

const useStyles = () => {
  const {color} = useTheme()
  const styles = StyleSheet.create({
    safeAreaView: {
      flex: 1,
      backgroundColor: color.bg_color_high,
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
      color: color.gray_c600,
    },

    galleryContainer: {
      flex: 1,
      flexGrow: 1,
    },
  })

  return styles
}

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
