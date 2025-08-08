import {atoms as a, useTheme} from '@yoroi/theme'
import * as React from 'react'
import {
  FlatList,
  Image,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native'

import {useNavigateTo} from '~/features/Portfolio/common/hooks/useNavigateTo'
import {usePortfolioBalances} from '~/features/Portfolio/common/hooks/usePortfolioBalances'
import {useStrings} from '~/kernel/i18n/useStrings'
import {useSelectedWallet} from '~/features/WalletManager/hooks/useSelectedWallet'
import {Icon} from '~/ui/Icon'
import {MediaPreview} from '~/ui/MediaPreview/MediaPreview'
import {Space} from '~/ui/Space/Space'
import placeholderDark from '~/assets/img/nft-placeholder-dark.png'
import placeholderLight from '~/assets/img/nft-placeholder.png'

export const DashboardNFTsList = () => {
  const {atoms: ta, palette: p, isDark} = useTheme()
  const navigationTo = useNavigateTo()
  const {width: SCREEN_WIDTH} = useWindowDimensions()
  const PADDING_LEFT_SIDE = 16
  const PADDING_RIGHT_SIDE_FOR_ITEMS = 15
  const GAP_ITEMS = 8
  const initCardWidth = SCREEN_WIDTH - PADDING_LEFT_SIDE
  const cardItemWidth =
    (initCardWidth - PADDING_RIGHT_SIDE_FOR_ITEMS - GAP_ITEMS) / 2

  const {wallet} = useSelectedWallet()
  const balances = usePortfolioBalances({wallet})
  const nftsList = balances.nfts ?? []
  const hasNotNfts = nftsList.length === 0

  const placeholder = isDark ? placeholderDark : placeholderLight

  const handleDirectNFTsList = () => {
    navigationTo.nftsList()
  }

  return (
    <View style={[a.flex_col, a.gap_lg]}>
      <Heading countNfts={nftsList.length} onPress={handleDirectNFTsList} />

      {hasNotNfts ? (
        <View style={[a.px_lg]}>
          <Image
            source={placeholder}
            style={[{width: 164, height: 164}, a.rounded_sm]}
          />
        </View>
      ) : null}

      <FlatList
        horizontal
        data={nftsList}
        ListHeaderComponent={<Space.Width.md />}
        ListFooterComponent={<Space.Width.md />}
        ItemSeparatorComponent={() => <Space.Width.sm />}
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.info.id}
        renderItem={({item}) => (
          <TouchableOpacity
            style={[
              {aspectRatio: 1 / 1, width: cardItemWidth},
              a.rounded_sm,
              {overflow: 'hidden'},
            ]}
            onPress={() => navigationTo.nftDetails(item.info.id)}
          >
            <MediaPreview
              info={item.info}
              width={cardItemWidth}
              height={cardItemWidth}
              style={a.rounded_sm}
            />
          </TouchableOpacity>
        )}
      />
    </View>
  )
}

type HeadingProps = {
  countNfts: number
  onPress: () => void
}
const Heading = ({countNfts, onPress}: HeadingProps) => {
  const {palette: p} = useTheme()
  const strings = useStrings()

  return (
    <TouchableOpacity
      onPress={onPress}
      style={[a.px_lg, a.flex_row, a.justify_between, a.align_center]}
    >
      <Text style={[a.body_1_lg_medium, {color: p.gray_900}]}>
        {strings.portfolio.nfts(countNfts)}
      </Text>
      <Icon.ArrowRight color={p.gray_800} size={24} />
    </TouchableOpacity>
  )
}
