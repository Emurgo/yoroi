import {useFocusEffect} from '@react-navigation/native'
import {FlashList, FlashListProps} from '@shopify/flash-list'
import {useTheme} from '@yoroi/theme'
import {Balance} from '@yoroi/types'
import React from 'react'
import {defineMessages, useIntl} from 'react-intl'
import {Alert, Linking, StyleSheet, TouchableOpacity, View} from 'react-native'

import {AmountItem, AmountItemProps} from '../../components/AmountItem/AmountItem'
import {Spacer} from '../../components/Spacer'
import {usePrivacyMode} from '../../features/Settings/PrivacyMode/PrivacyMode'
import {useSelectedWallet} from '../../features/WalletManager/Context'
import globalMessages, {actionMessages} from '../../i18n/global-messages'
import {useMetrics} from '../../metrics/metricsManager'
import {sortTokenInfos} from '../../utils'
import {getNetworkConfigById} from '../../yoroi-wallets/cardano/networks'
import {useBalances, useTokenInfos} from '../../yoroi-wallets/hooks'
import {Amounts} from '../../yoroi-wallets/utils'
import {ActionsBanner} from './ActionsBanner'

type ListProps = FlashListProps<Balance.TokenInfo>
type Props = Partial<ListProps> & {
  onScroll: ListProps['onScroll']
  refreshing: boolean
  onRefresh: () => void
}
export const AssetList = (props: Props) => {
  const strings = useStrings()
  const styles = useStyles()
  const wallet = useSelectedWallet()
  const balances = useBalances(wallet)
  const {track} = useMetrics()

  useFocusEffect(
    React.useCallback(() => {
      track.assetsPageViewed()
    }, [track]),
  )

  const handleOnPressNFTs = () => Alert.alert(strings.soon, strings.soon)
  const handleOnPressTokens = () => Alert.alert(strings.soon, strings.soon)
  const handleSearch = () => Alert.alert(strings.soon, strings.soon)

  const config = getNetworkConfigById(wallet.networkId)

  const tokenInfos = useTokenInfos({
    wallet,
    tokenIds: Amounts.toArray(balances).map(({tokenId}) => tokenId),
  })

  return (
    <View style={styles.assetList} testID="assetList">
      <ActionsBanner
        tokensLabel={strings.tokens(tokenInfos.length)}
        nftsLabel={strings.nfts(0)}
        onPressNFTs={handleOnPressNFTs}
        onPressTokens={handleOnPressTokens}
        onSearch={handleSearch}
      />

      <FlashList
        {...props}
        data={sortTokenInfos({wallet, tokenInfos})}
        renderItem={({item: tokenInfo}) => (
          <ExplorableAssetItem
            wallet={wallet}
            amount={Amounts.getAmount(balances, tokenInfo.id)}
            onPress={() => Linking.openURL(config.EXPLORER_URL_FOR_TOKEN(tokenInfo.id))}
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
  const {isPrivacyOff} = usePrivacyMode()
  return (
    <TouchableOpacity style={styles.button} onPress={onPress} testID="assetSelectorItem">
      <AmountItem isPrivacyOff={isPrivacyOff} wallet={wallet} amount={amount} />
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

const messages = defineMessages({
  unknownAsset: {
    id: 'components.send.assetselectorscreen.unknownAsset',
    defaultMessage: '!!!Unknown asset',
  },
})

const useStrings = () => {
  const intl = useIntl()

  return {
    unknown: intl.formatMessage(messages.unknownAsset),
    tokens: (qty: number) => `${intl.formatMessage(globalMessages.tokens, {qty})} (${qty})`,
    nfts: (qty: number) => `${intl.formatMessage(globalMessages.nfts, {qty})} (${qty})`,
    soon: intl.formatMessage(actionMessages.soon),
  }
}
