import {useTheme} from '@yoroi/theme'
import * as React from 'react'
import {FlatList, Image, StyleSheet, Text, TouchableOpacity, TouchableOpacityProps, View} from 'react-native'

import nftPlaceholder from '../../../../assets/img/nft-placeholder.png'
import {Icon, Spacer} from '../../../../components'
import {usePortfolioBalances} from '../../../../features/Portfolio/common/hooks/usePortfolioBalances'
import {MediaPreview} from '../../../../features/Portfolio/common/MediaPreview/MediaPreview'
import {useSelectedWallet} from '../../../../features/WalletManager/context/SelectedWalletContext'
import {useNavigateTo} from '../useNavigationTo'
import {useStrings} from '../useStrings'

export const DashboardNFTsList = () => {
  const {styles} = useStyles()
  const strings = useStrings()
  const navigationTo = useNavigateTo()

  const wallet = useSelectedWallet()

  const balances = usePortfolioBalances({wallet})
  const nftsList = balances.nfts ?? []
  const hasNotNfts = nftsList.length === 0

  const handleDirectNFTsList = () => {
    navigationTo.nftsList()
  }

  return (
    <View style={styles.root}>
      <View style={[styles.container, styles.actionsContainer]}>
        <Text style={styles.title}>{strings.nfts(nftsList.length)}</Text>

        <TouchNFTsList onPress={handleDirectNFTsList} />
      </View>

      {hasNotNfts ? (
        <View style={styles.container}>
          <Image source={nftPlaceholder} style={[styles.placeholderNft, styles.image]} />
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
          <View>
            <MediaPreview info={item.info} width={164} height={164} style={styles.image} />
          </View>
        )}
      />
    </View>
  )
}

const TouchNFTsList = ({onPress}: TouchableOpacityProps) => (
  <TouchableOpacity onPress={onPress}>
    <Icon.ArrowRight size={24} />
  </TouchableOpacity>
)

const useStyles = () => {
  const {atoms} = useTheme()
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
    },
    image: {
      ...atoms.rounded_sm,
      overlayColor: '#FFFFFF',
    },
    placeholderNft: {
      width: 164,
      height: 164,
    },
  })

  return {styles} as const
}
