import {useFocusEffect} from '@react-navigation/native'
import {FlashList, FlashListProps} from '@shopify/flash-list'
import {Balance} from '@yoroi/types'
import React from 'react'
import {defineMessages, useIntl} from 'react-intl'
import {Alert, Linking, StyleSheet, TouchableOpacity, View} from 'react-native'

import {AmountItem, AmountItemProps} from '../../components/AmountItem/AmountItem'
import {Spacer} from '../../components/Spacer'
import {usePrivacyMode} from '../../features/Settings/PrivacyMode/PrivacyMode'
import globalMessages, {actionMessages} from '../../i18n/global-messages'
import {useMetrics} from '../../metrics/metricsManager'
import {useSelectedWallet} from '../../SelectedWallet'
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
        contentContainerStyle={{paddingTop: 16, paddingHorizontal: 16, paddingBottom: 8}}
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
  const {isPrivacyOff} = usePrivacyMode()
  return (
    <TouchableOpacity style={styles.button} onPress={onPress} testID="assetSelectorItem">
      <AmountItem isPrivacyOff={isPrivacyOff} wallet={wallet} amount={amount} />
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  assetList: {flex: 1},
  button: {
    backgroundColor: '#fff',
    shadowColor: '#181a1e',
    borderRadius: 8,
    elevation: 2,
    shadowOffset: {width: 0, height: -2},
    shadowRadius: 10,
    shadowOpacity: 0.08,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
})

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
