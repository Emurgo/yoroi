import {FlashList, FlashListProps} from '@shopify/flash-list'
import {Portfolio} from '@yoroi/types'
import React from 'react'
import {defineMessages, useIntl} from 'react-intl'
import {Alert, Linking, StyleSheet, TouchableOpacity, View} from 'react-native'

import {AmountItem, AmountItemProps} from '../../components/AmountItem/AmountItem'
import {Spacer} from '../../components/Spacer'
import {usePrivacyMode} from '../../features/Settings/PrivacyMode/PrivacyMode'
import globalMessages, {actionMessages} from '../../i18n/global-messages'
import {useSelectedWallet} from '../../SelectedWallet'
import {sortTokenInfos} from '../../utils'
import {getNetworkConfigById} from '../../yoroi-wallets/cardano/networks'
import {Tokens} from '../../yoroi-wallets/portfolio/helpers/tokens'
import {Amounts} from '../../yoroi-wallets/utils'
import {ActionsBanner} from './ActionsBanner'

type ListProps = FlashListProps<Portfolio.TokenInfo>
type Props = Partial<ListProps> & {
  onScroll: ListProps['onScroll']
  refreshing: boolean
  onRefresh: () => void
}
export const AssetList = (props: Props) => {
  const strings = useStrings()
  const wallet = useSelectedWallet()

  const sortedTokens = wallet.sortedTokens

  const handleOnPressNFTs = () => Alert.alert(strings.soon, strings.soon)
  const handleOnPressTokens = () => Alert.alert(strings.soon, strings.soon)
  const handleSearch = () => Alert.alert(strings.soon, strings.soon)

  const config = getNetworkConfigById(wallet.networkId)

  return (
    <View style={styles.assetList} testID="assetList">
      <ActionsBanner
        tokensLabel={strings.tokens(sortedTokens.length)}
        nftsLabel={strings.nfts(0)}
        onPressNFTs={handleOnPressNFTs}
        onPressTokens={handleOnPressTokens}
        onSearch={handleSearch}
      />

      <FlashList
        {...props}
        data={sortedTokens}
        renderItem={({item: token}) => (
          <ExplorableToken
            wallet={wallet}
            token={token}
            onPress={() => Linking.openURL(config.EXPLORER_URL_FOR_TOKEN(token.info.id))}
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

type ExplorableTokenProps = AmountItemProps & {
  onPress(): void
}
const ExplorableToken = ({wallet, token, onPress}: ExplorableTokenProps) => {
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
