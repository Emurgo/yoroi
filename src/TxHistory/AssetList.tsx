import React from 'react'
import {defineMessages} from 'react-intl'
import {useIntl} from 'react-intl'
import {Alert, FlatList, StyleSheet, TouchableOpacity, View} from 'react-native'
import {Avatar} from 'react-native-paper'
import {SafeAreaView} from 'react-native-safe-area-context'
import {useSelector} from 'react-redux'

import {Text} from '../../legacy/components/UiKit'
import globalMessages, {actionMessages} from '../../legacy/i18n/global-messages'
import {tokenBalanceSelector, tokenInfoSelector} from '../../legacy/selectors'
import {COLORS} from '../../legacy/styles/config'
import {formatTokenAmount, getAssetDenominationOrId} from '../../legacy/utils/format'
import AdaImage from '../assets/img/icon/asset_ada.png'
import NoImage from '../assets/img/icon/asset_no_image.png'
import {Spacer} from '../components/Spacer'
import {TxListActionsBannerForAssetsTab} from './TxListActionsBanner'
import {Token, TokenEntry} from './types'

type AssetListProps = {
  refreshing: boolean
  onRefresh: () => void
}

export const AssetList = ({refreshing, onRefresh}: AssetListProps) => {
  const strings = useStrings()
  const tokenBalance = useSelector(tokenBalanceSelector)
  const assetTokenInfos = useSelector(tokenInfoSelector)
  const assetTokens: Array<TokenEntry> = tokenBalance.values

  const orderedTokens = assetTokens
    .sort((a, b) => (a.amount.isGreaterThan(b.amount) ? -1 : 1))
    .sort((a) => (getTokenInfo(assetTokenInfos, a)?.isDefault ? -1 : 1))

  const handleOnPressNFTs = () => Alert.alert(strings.soon, strings.soon)
  const handleOnPressTokens = () => Alert.alert(strings.soon, strings.soon)
  const handleSearch = () => Alert.alert(strings.soon, strings.soon)

  return (
    <SafeAreaView edges={['left', 'right', 'bottom']} style={styles.listRoot}>
      <TxListActionsBannerForAssetsTab
        tokensLabel={strings.tokens(orderedTokens.length)}
        nftsLabel={strings.nfts(0)}
        onPressNFTs={handleOnPressNFTs}
        onPressTokens={handleOnPressTokens}
        onSearch={handleSearch}
      />

      <FlatList
        onRefresh={onRefresh}
        refreshing={refreshing}
        data={orderedTokens}
        renderItem={({item: assetToken}) => (
          <AssetItem
            key={assetToken.identifier}
            assetToken={assetToken}
            tokenInfo={assetTokenInfos[assetToken.identifier]}
          />
        )}
        ItemSeparatorComponent={() => <Spacer height={16} />}
        bounces={false}
        contentContainerStyle={{paddingTop: 16, paddingHorizontal: 16}}
        keyExtractor={(item) => item.identifier}
      />
    </SafeAreaView>
  )
}

type AssetItemProps = {
  assetToken: TokenEntry
  tokenInfo: Token
  onPress?: () => void
}

const AssetItem = ({assetToken, tokenInfo, onPress}: AssetItemProps) => {
  const strings = useStrings()
  return (
    <TouchableOpacity onPress={onPress}>
      <View style={styles.tokenRoot}>
        <View style={styles.tokenAvatar}>
          <Icon source={tokenInfo.isDefault ? AdaImage : NoImage} />
        </View>

        <View style={styles.tokenData}>
          <Text numberOfLines={1} ellipsizeMode={'middle'} style={styles.tokenInfo}>
            {getAssetDenominationOrId(tokenInfo) || strings.unknown}
          </Text>
          <Text numberOfLines={1} ellipsizeMode={'middle'} style={styles.tokenName}>
            {tokenInfo.metadata.assetName}
          </Text>
        </View>

        <View>
          <Text style={styles.tokenAmount}>{formatTokenAmount(assetToken.amount, tokenInfo, 15)}</Text>
        </View>
      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  listRoot: {
    flex: 1,
  },
  tokenRoot: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderRadius: 8,
    elevation: 2,
    shadowOffset: {width: 0, height: -2},
    shadowRadius: 10,
    shadowOpacity: 0.08,
    shadowColor: '#181a1e',
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  tokenAvatar: {
    padding: 4,
  },
  tokenData: {
    flex: 1,
    padding: 4,
  },
  tokenInfo: {
    color: COLORS.DARK_TEXT,
    fontSize: 14,
    lineHeight: 22,
  },
  tokenName: {
    color: COLORS.TEXT_INPUT,
    fontSize: 12,
    lineHeight: 18,
  },
  tokenAmount: {
    color: COLORS.DARK_TEXT,
  },
})

const getTokenInfo = (assetTokenInfos: Record<string, Token>, token: TokenEntry) => assetTokenInfos[token.identifier]

const Icon = (props) => (
  <Avatar.Image
    {...props}
    size={32}
    style={{alignItems: 'center', justifyContent: 'center', backgroundColor: 'transparent'}}
  />
)

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
