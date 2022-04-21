import React from 'react'
import {defineMessages} from 'react-intl'
import {useIntl} from 'react-intl'
import {Alert, FlatList, FlatListProps, StyleSheet, TouchableOpacity, View} from 'react-native'
import {Avatar} from 'react-native-paper'
import {SafeAreaView} from 'react-native-safe-area-context'
import {useSelector} from 'react-redux'

import AdaImage from '../../assets/img/asset_ada.png'
import NoImage from '../../assets/img/asset_no_image.png'
import {Boundary, Text} from '../../components'
import {Spacer} from '../../components/Spacer'
import {useTokenInfo} from '../../hooks'
import globalMessages, {actionMessages} from '../../i18n/global-messages'
import {formatTokenAmount, getAssetDenominationOrId, getTokenFingerprint} from '../../legacy/format'
import {tokenBalanceSelector} from '../../legacy/selectors'
import {useSelectedWallet} from '../../SelectedWallet'
import {COLORS} from '../../theme'
import {TokenEntry} from '../../types'
import {useOnScroll} from '../useOnScroll'
import {ActionsBanner} from './ActionsBanner'

type ListProps = FlatListProps<TokenEntry>
type Props = Partial<ListProps> & {
  onScrollUp: ListProps['onScroll']
  onScrollDown: ListProps['onScroll']
  refreshing: boolean
  onRefresh: () => void
}
export const AssetList = ({onScrollUp, onScrollDown, ...props}: Props) => {
  const strings = useStrings()
  const tokenBalance = useSelector(tokenBalanceSelector)
  const assetTokens: Array<TokenEntry> = tokenBalance.values

  const orderedTokens = assetTokens
    .sort((assetTokenA, assetTokenB) => (assetTokenA.amount.isGreaterThan(assetTokenB.amount) ? -1 : 1))
    .sort((assetToken) => (assetToken.identifier === '' ? -1 : 1))

  const handleOnPressNFTs = () => Alert.alert(strings.soon, strings.soon)
  const handleOnPressTokens = () => Alert.alert(strings.soon, strings.soon)
  const handleSearch = () => Alert.alert(strings.soon, strings.soon)

  const onScroll = useOnScroll({onScrollUp, onScrollDown})

  return (
    <SafeAreaView edges={['left', 'right', 'bottom']} style={styles.listRoot}>
      <ActionsBanner
        tokensLabel={strings.tokens(orderedTokens.length)}
        nftsLabel={strings.nfts(0)}
        onPressNFTs={handleOnPressNFTs}
        onPressTokens={handleOnPressTokens}
        onSearch={handleSearch}
      />

      <FlatList
        {...props}
        {...onScroll}
        data={orderedTokens}
        renderItem={({item: assetToken}) => (
          <Boundary fallbackProps={{size: 'small'}}>
            <AssetItem key={assetToken.identifier} assetToken={assetToken} />
          </Boundary>
        )}
        ItemSeparatorComponent={() => <Spacer height={16} />}
        contentContainerStyle={{paddingTop: 16, paddingHorizontal: 16}}
        keyExtractor={(item) => item.identifier}
      />
    </SafeAreaView>
  )
}

type AssetItemProps = {
  assetToken: TokenEntry
  onPress?: () => void
}

const AssetItem = ({assetToken, onPress}: AssetItemProps) => {
  const strings = useStrings()
  const wallet = useSelectedWallet()
  const tokenInfo = useTokenInfo({wallet, tokenId: assetToken.identifier})

  return (
    <TouchableOpacity onPress={onPress}>
      <View style={styles.tokenRoot}>
        <View style={styles.tokenAvatar}>
          <Icon source={tokenInfo.isDefault ? AdaImage : NoImage} />
        </View>

        <View style={styles.tokenData}>
          <Text numberOfLines={1} ellipsizeMode="middle" style={styles.tokenInfo}>
            {getAssetDenominationOrId(tokenInfo) || strings.unknown}
          </Text>
          <Text numberOfLines={1} ellipsizeMode="middle" style={styles.tokenName}>
            {tokenInfo.isDefault ? '' : getTokenFingerprint(tokenInfo)}
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
