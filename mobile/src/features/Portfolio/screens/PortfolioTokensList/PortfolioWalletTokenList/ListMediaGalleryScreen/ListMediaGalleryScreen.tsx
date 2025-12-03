import {infoFilterByName} from '@yoroi/portfolio'
import {atoms as a, useTheme} from '@yoroi/theme'
import {Portfolio} from '@yoroi/types'

import * as React from 'react'
import {ScrollView, Text, View} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'

import {useAnalyticsTracking} from '~/features/Analytics/hooks/useAnalyticsTracking'
import {AnalyticsEventEnum} from '~/features/Analytics/types/analytics-event-enum'
import {usePortfolioBalances} from '~/features/Portfolio/common/hooks/usePortfolioBalances'
import {useNavigateTo} from '~/features/Portfolio/common/navigation'
import {MediaGallery} from '~/features/Portfolio/ui/MediaGallery/MediaGallery'
import {useSearch, useSearchOnNavBar} from '~/features/Search/SearchContext'
import {NetworkTag} from '~/features/Settings/ui/shared/NetworkTag'
import {useSelectedWallet} from '@yoroi/wallet-manager/hooks/useSelectedWallet'
import {useStrings} from '~/kernel/i18n/useStrings'
import {Space} from '~/ui/Space/Space'

import {EmptyGallery} from './EmptyGallery'

export const ListMediaGalleryScreen = () => {
  const navigateTo = useNavigateTo()
  const strings = useStrings()
  const {wallet} = useSelectedWallet()
  const balances = usePortfolioBalances({wallet})
  const {trackEvent} = useAnalyticsTracking()

  React.useEffect(() => {
    trackEvent(AnalyticsEventEnum.NFTGalleryPageViewed, {
      nft_count: balances.nfts.length,
    })
  }, [trackEvent, balances.nfts.length])

  // use case: search nfts
  useSearchOnNavBar({
    title: strings.portfolio.title,
    placeholder: strings.portfolio.search,
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

  const hasEmptySearchResult = isSearching && filteredAmounts.length === 0
  const hasNotNfts = balances.nfts.length === 0

  if (hasEmptySearchResult) {
    return (
      <Wrapper>
        <ScrollView
          style={[a.flex_1, a.flex_grow]}
          contentContainerStyle={[a.flex_1]}
        >
          <EmptyGallery message={strings.portfolio.noNftsFound} />
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
            message={strings.portfolio.noNftsInWallet}
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

const Wrapper = ({children}: React.PropsWithChildren) => {
  const {atoms: ta} = useTheme()
  return (
    <SafeAreaView
      edges={['left', 'right', 'bottom']}
      style={[ta.bg_color_max, a.flex_1]}
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
      >{`${strings.portfolio.nftCount}: ${count ?? '-'}`}</Text>
    </View>
  )
}
