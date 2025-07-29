import {useFocusEffect} from '@react-navigation/native'
import {infoFilterByName} from '@yoroi/portfolio'
import {atoms as a, useTheme} from '@yoroi/theme'
import {Portfolio} from '@yoroi/types'
import React, {ReactNode} from 'react'
import {ScrollView, Text, View} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'

import {usePortfolioBalances} from '~/features/Portfolio/common/hooks/usePortfolioBalances'
import {useTrackNftGallerySearchActivated} from '~/features/Portfolio/common/hooks/useTrackNftGallerySearchActivated'
import {useStrings} from '~/features/ReviewTx/common/hooks/useStrings'
import {useSearch, useSearchOnNavBar} from '~/features/Search/SearchContext'
import {NetworkTag} from '~/features/Settings/useCases/changeAppSettings/ChangeNetwork/NetworkTag'
import {useSelectedWallet} from '~/features/WalletManager/hooks/useSelectedWallet'
import {useMetrics} from '~/kernel/metrics/metricsManager'
import {MediaGallery} from '~/ui/MediaGallery/MediaGallery'
import {Space} from '~/ui/Space/Space'
import {useNavigateTo} from '../../common/navigation'
import {EmptyGallery} from './EmptyGallery'

export const ListMediaGalleryScreen = () => {
  const navigateTo = useNavigateTo()
  const strings = useStrings()
  const {palette: p} = useTheme()
  const {track} = useMetrics()

  const {wallet} = useSelectedWallet()
  const balances = usePortfolioBalances({wallet})

  // use case: search nfts
  useSearchOnNavBar({
    title: strings.title,
    placeholder: strings.search,
    extraNavigationOptions: {
      headerTitle: ({children}) => <NetworkTag>{children}</NetworkTag>,
    },
  })
  const {search, isSearching} = useSearch()

  const filteredAmounts = React.useMemo(() => {
    const byName = infoFilterByName(search)
    return isSearching
      ? balances.nfts.filter(({info}) => byName(info))
      : balances.nfts
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
        <ScrollView
          style={[a.flex_1, a.flex_grow]}
          contentContainerStyle={[a.flex_1]}
        >
          <EmptyGallery message={strings.noNftsFound} />
        </ScrollView>
      </Wrapper>
    )
  }

  if (hasNotNfts) {
    return (
      <Wrapper>
        <ScrollView
          style={[a.flex_1, a.flex_grow]}
          contentContainerStyle={[a.flex_1]}
        >
          <EmptyGallery
            message={strings.noNftsInWallet}
            heading={
              <View>
                <NftCount count={0} />

                <Space.Height.lg />
              </View>
            }
          />
        </ScrollView>
      </Wrapper>
    )
  }

  return (
    <Wrapper>
      <View style={[a.flex_1, a.flex_grow]}>
        {isSearching && (
          <>
            <NftCount count={filteredAmounts.length} />

            <Space.Height.lg />
          </>
        )}

        <MediaGallery
          amounts={filteredAmounts}
          onSelect={(amount: Portfolio.Token.Amount) =>
            navigateTo.nftDetails(amount.info.id)
          }
        />
      </View>
    </Wrapper>
  )
}

const Wrapper = ({children}: {children: ReactNode}) => {
  const {palette: p} = useTheme()
  return (
    <SafeAreaView
      edges={['left', 'right', 'bottom']}
      style={[{backgroundColor: p.bg_color_max}, a.flex_1]}
    >
      <View style={[a.flex_col, a.flex_1]}>
        <Space.Height.lg />

        {children}
      </View>
    </SafeAreaView>
  )
}

const NftCount = ({count}: {count?: number | string}) => {
  const strings = useStrings()
  const {palette: p} = useTheme()

  return (
    <View style={{height: 22}} testID="txtNftCount">
      <Text
        style={[{color: p.text_gray_medium}, a.flex_1, a.text_center]}
      >{`${strings.nftCount}: ${count ?? '-'}`}</Text>
    </View>
  )
}
