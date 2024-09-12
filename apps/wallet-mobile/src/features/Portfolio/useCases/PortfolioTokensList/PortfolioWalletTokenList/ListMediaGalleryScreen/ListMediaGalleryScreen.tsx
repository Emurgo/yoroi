import {useFocusEffect} from '@react-navigation/native'
import {infoFilterByName} from '@yoroi/portfolio'
import {useTheme} from '@yoroi/theme'
import {Portfolio} from '@yoroi/types'
import React, {ReactNode} from 'react'
import {ScrollView, StyleSheet, Text, View} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'

import {Space} from '../../../../../../components/Space/Space'
import {useMetrics} from '../../../../../../kernel/metrics/metricsManager'
import {useSearch, useSearchOnNavBar} from '../../../../../Search/SearchContext'
import {NetworkTag} from '../../../../../Settings/ChangeNetwork/NetworkTag'
import {useSelectedWallet} from '../../../../../WalletManager/common/hooks/useSelectedWallet'
import {usePortfolioBalances} from '../../../../common/hooks/usePortfolioBalances'
import {useStrings} from '../../../../common/hooks/useStrings'
import {useTrackNftGallerySearchActivated} from '../../../../common/hooks/useTrackNftGallerySearchActivated'
import {MediaGallery} from '../../../../common/MediaGallery/MediaGallery'
import {useNavigateTo} from '../../../../common/navigation'
import {EmptyGallery} from './EmptyGallery'

export const ListMediaGalleryScreen = () => {
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
          <EmptyGallery message={strings.noNftsFound} />
        </ScrollView>
      </Wrapper>
    )
  }

  if (hasNotNfts) {
    return (
      <Wrapper>
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollViewError}>
          <EmptyGallery
            message={strings.noNftsInWallet}
            heading={
              <View>
                <NftCount count={0} />

                <Space height="lg" />
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

            <Space height="lg" />
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
        <Space height="lg" />

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
  const {color, atoms} = useTheme()
  const styles = StyleSheet.create({
    safeAreaView: {
      backgroundColor: color.bg_color_max,
      ...atoms.flex_1,
    },
    container: {
      ...atoms.flex_col,
      ...atoms.flex_1,
    },
    scrollView: {
      ...atoms.flex_1,
      ...atoms.flex_grow,
    },
    scrollViewError: {
      ...atoms.flex_1,
    },
    countBar: {
      height: 22,
    },
    count: {
      color: color.text_gray_medium,
      ...atoms.flex_1,
      ...atoms.text_center,
    },
    galleryContainer: {
      ...atoms.flex_1,
      ...atoms.flex_grow,
    },
  })

  return styles
}
