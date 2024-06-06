import {useFocusEffect} from '@react-navigation/native'
import {FlashList, FlashListProps} from '@shopify/flash-list'
import {useExplorers} from '@yoroi/explorers'
import {useTheme} from '@yoroi/theme'
import {Balance} from '@yoroi/types'
import React from 'react'
import {Linking, StyleSheet, TouchableOpacity, View} from 'react-native'

import {AmountItem, AmountItemProps} from '../../../components/AmountItem/AmountItem'
import {Spacer} from '../../../components/Spacer'
import {usePrivacyMode} from '../../../features/Settings/PrivacyMode/PrivacyMode'
import {useSelectedWallet} from '../../../features/WalletManager/context/SelectedWalletContext'
import {useMetrics} from '../../../kernel/metrics/metricsManager'
import {useBalances, useTokenInfos} from '../../../yoroi-wallets/hooks'
import {Amounts} from '../../../yoroi-wallets/utils'
import {sortTokenInfos} from '../../../yoroi-wallets/utils/sorting'

type ListProps = FlashListProps<Balance.TokenInfo>
type Props = Partial<ListProps> & {
  onScroll: ListProps['onScroll']
  refreshing: boolean
  onRefresh: () => void
}
export const AssetList = (props: Props) => {
  const styles = useStyles()
  const wallet = useSelectedWallet()
  const explorers = useExplorers(wallet.networkManager.network)
  const balances = useBalances(wallet)
  const {track} = useMetrics()

  useFocusEffect(
    React.useCallback(() => {
      track.assetsPageViewed()
    }, [track]),
  )

  const tokenInfos = useTokenInfos({
    wallet,
    tokenIds: Amounts.toArray(balances).map(({tokenId}) => tokenId),
  })

  return (
    <View style={styles.assetList} testID="assetList">
      <FlashList
        {...props}
        data={sortTokenInfos({wallet, tokenInfos})}
        renderItem={({item: tokenInfo}) => (
          <ExplorableAssetItem
            wallet={wallet}
            amount={Amounts.getAmount(balances, tokenInfo.id)}
            onPress={() => Linking.openURL(explorers.cardanoscan.token(tokenInfo.id))}
          />
        )}
        ItemSeparatorComponent={() => <Spacer height={16} />}
        contentContainerStyle={styles.content}
        keyExtractor={(_, index) => index.toString()}
        estimatedItemSize={78}
      />
    </View>
  )
}

type ExplorableAssetItemProps = AmountItemProps & {
  onPress(): void
}
const ExplorableAssetItem = ({wallet, amount, onPress}: ExplorableAssetItemProps) => {
  const styles = useStyles()
  const {isPrivacyActive} = usePrivacyMode()
  return (
    <TouchableOpacity style={styles.button} onPress={onPress} testID="assetSelectorItem">
      <AmountItem isPrivacyActive={isPrivacyActive} wallet={wallet} amount={amount} />
    </TouchableOpacity>
  )
}

const useStyles = () => {
  const {color, atoms} = useTheme()
  const styles = StyleSheet.create({
    content: {
      ...atoms.pt_lg,
      ...atoms.px_lg,
      ...atoms.pb_sm,
    },
    assetList: {flex: 1},
    button: {
      ...atoms.p_md,
      backgroundColor: color.gray_cmin,
      shadowColor: color.gray_c100,
      borderRadius: 8,
      elevation: 2,
      shadowOffset: {width: 0, height: -2},
      shadowRadius: 10,
      shadowOpacity: 0.08,
    },
  })

  return styles
}
