import {useTheme} from '@yoroi/theme'
import * as React from 'react'
import {FlatList, Image, StyleSheet, Text, TouchableOpacity, useWindowDimensions, View} from 'react-native'

import placeholderLight from '../../../../../assets/img/nft-placeholder.png'
import placeholderDark from '../../../../../assets/img/nft-placeholder-dark.png'
import {Icon, Spacer} from '../../../../../components'
import {useSelectedWallet} from '../../../../WalletManager/common/hooks/useSelectedWallet'
import {usePortfolioBalances} from '../../../common/hooks/usePortfolioBalances'
import {MediaPreview} from '../../../common/MediaPreview/MediaPreview'
import {useNavigateTo} from '../../../common/useNavigateTo'
import {useStrings} from '../../../common/useStrings'

export const DashboardNFTsList = () => {
  const {styles, cardItemWidth} = useStyles()
  const navigationTo = useNavigateTo()
  const {isDark} = useTheme()

  const {wallet} = useSelectedWallet()
  const balances = usePortfolioBalances({wallet})
  const nftsList = balances.nfts ?? []
  const hasNotNfts = nftsList.length === 0

  const placeholder = isDark ? placeholderDark : placeholderLight

  const handleDirectNFTsList = () => {
    navigationTo.nftsList()
  }

  return (
    <View style={styles.root}>
      <Heading countNfts={nftsList.length} onPress={handleDirectNFTsList} />

      {hasNotNfts ? (
        <View style={styles.container}>
          <Image source={placeholder} style={[styles.placeholderNft, styles.image]} />
        </View>
      ) : null}

      <FlatList
        horizontal
        data={nftsList}
        ListHeaderComponent={<Spacer width={16} />}
        ListFooterComponent={<Spacer width={16} />}
        ItemSeparatorComponent={() => <Spacer width={8} />}
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.info.id}
        renderItem={({item}) => (
          <TouchableOpacity
            style={[styles.nftItemContainer, {width: cardItemWidth}]}
            onPress={() => navigationTo.nftDetails(item.info.id)}
          >
            <MediaPreview info={item.info} width={cardItemWidth} height={cardItemWidth} style={styles.image} />
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
  const {styles, colors} = useStyles()
  const strings = useStrings()

  return (
    <TouchableOpacity onPress={onPress} style={[styles.container, styles.actionsContainer]}>
      <Text style={styles.title}>{strings.nfts(countNfts)}</Text>

      <Icon.ArrowRight color={colors.gray_800} size={24} />
    </TouchableOpacity>
  )
}

const useStyles = () => {
  const {atoms, color} = useTheme()
  const {width: SCREEN_WIDTH} = useWindowDimensions()
  const PADDING_LEFT_SIDE = 16
  const PADDING_RIGHT_SIDE_FOR_ITEMS = 15
  const GAP_ITEMS = 8
  const initCardWidth = SCREEN_WIDTH - PADDING_LEFT_SIDE
  const cardItemWidth = (initCardWidth - PADDING_RIGHT_SIDE_FOR_ITEMS - GAP_ITEMS) / 2

  const styles = StyleSheet.create({
    container: {
      ...atoms.px_lg,
    },
    root: {
      ...atoms.flex_col,
      ...atoms.gap_lg,
    },
    actionsContainer: {
      ...atoms.flex_row,
      ...atoms.justify_between,
      ...atoms.align_center,
    },
    title: {
      ...atoms.body_1_lg_medium,
      color: color.gray_900,
    },
    image: {
      ...atoms.rounded_sm,
    },
    placeholderNft: {
      width: 164,
      height: 164,
    },
    nftItemContainer: {
      aspectRatio: 1 / 1,
      ...atoms.rounded_sm,
      overflow: 'hidden',
    },
  })
  const colors = {
    gray_800: color.gray_800,
  }

  return {styles, colors, cardItemWidth} as const
}
