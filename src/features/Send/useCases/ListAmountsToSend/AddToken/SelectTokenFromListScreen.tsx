import {useNavigation} from '@react-navigation/native'
import {FlashList} from '@shopify/flash-list'
import React from 'react'
import {defineMessages, useIntl} from 'react-intl'
import {Image, StyleSheet, TouchableOpacity, View} from 'react-native'

import noAssetsImage from '../../../../../assets/img/no-assets-found.png'
import {Boundary, Spacer, Text} from '../../../../../components'
import {AmountItem} from '../../../../../components/AmountItem/AmountItem'
import globalMessages, {txLabels} from '../../../../../i18n/global-messages'
import {TxHistoryRouteNavigation} from '../../../../../navigation'
import {useSearch} from '../../../../../Search'
import {useSelectedWallet} from '../../../../../SelectedWallet'
import {sortTokenInfos} from '../../../../../utils'
import {YoroiWallet} from '../../../../../yoroi-wallets/cardano/types'
import {maxTokensPerTx} from '../../../../../yoroi-wallets/contants'
import {useBalances, useNfts, useTokenInfos} from '../../../../../yoroi-wallets/hooks'
import {TokenInfo, YoroiNft} from '../../../../../yoroi-wallets/types'
import {Amounts, Quantities} from '../../../../../yoroi-wallets/utils'
import {filterTokenInfos} from '../../../common/filterTokenInfos'
import {useSelectedTokensCounter, useSend, useTokenQuantities} from '../../../common/SendContext'
import {MaxTokensPerTx} from './ShowError/MaxTokensPerTx'

export type Tabs = 'all' | 'tokens' | 'nfts'

export const SelectTokenFromListScreen = () => {
  const wallet = useSelectedWallet()
  const [activeTab, setActiveTab] = React.useState<Tabs>('all')

  const balances = useBalances(wallet)
  const {nfts} = useNfts(wallet)

  const tokenInfos = useTokenInfos({
    wallet,
    tokenIds: Amounts.toArray(balances).map(({tokenId}) => tokenId),
  })
  const selectedTokensCounter = useSelectedTokensCounter()
  const canAddToken = selectedTokensCounter < maxTokensPerTx

  const {search: tokenInfoSearchTerm} = useSearch()
  const searchFilteredTokens = filterTokenInfos(tokenInfoSearchTerm, tokenInfos)
  const tabFilteredTokens = filterTokenInfosByTab({nfts, activeTab, tokenInfos: searchFilteredTokens})
  const sortedFilteredTokenInfos = sortTokenInfos({wallet, tokenInfos: tabFilteredTokens})

  return (
    <View style={styles.container}>
      <View style={styles.subheader}>
        {!canAddToken && (
          <>
            <MaxTokensPerTx />

            <Spacer height={16} />
          </>
        )}

        <Tabs activeTab={activeTab} setActiveTab={setActiveTab} />
      </View>

      <FlashList
        data={sortedFilteredTokenInfos}
        renderItem={({item: tokenInfo}: {item: TokenInfo}) => (
          <Boundary>
            <SelectableAssetItem tokenInfo={tokenInfo} disabled={!canAddToken} wallet={wallet} />
          </Boundary>
        )}
        bounces={false}
        contentContainerStyle={styles.list}
        keyExtractor={(_, index) => index.toString()}
        testID="assetsList"
        estimatedItemSize={78}
        ListEmptyComponent={
          tokenInfoSearchTerm.length > 0 && sortedFilteredTokenInfos.length === 0 ? <NoAssets /> : undefined
        }
      />
    </View>
  )
}

const Tabs = ({setActiveTab, activeTab}: {setActiveTab: (activeTab: Tabs) => void; activeTab: Tabs}) => {
  const strings = useStrings()

  return (
    <View style={styles.tabs}>
      <Tab activeTab={activeTab} setActiveTab={setActiveTab} text={strings.all} tab="all" />

      <Tab activeTab={activeTab} setActiveTab={setActiveTab} text={strings.tokens} tab="tokens" />

      <Tab activeTab={activeTab} setActiveTab={setActiveTab} text={strings.nfts} tab="nfts" />
    </View>
  )
}

const Tab = ({
  setActiveTab,
  activeTab,
  tab,
  text,
}: {
  setActiveTab: (activeTab: Tabs) => void
  activeTab: Tabs
  tab: Tabs
  text: string
}) => {
  return (
    <TouchableOpacity
      onPress={() => setActiveTab(tab)}
      style={[styles.tabContainer, activeTab === tab && styles.tabContainerActive]}
    >
      <Text
        style={[
          styles.tab,
          {
            color: activeTab === tab ? '#3154CB' : '#6B7384',
          },
        ]}
      >
        {text}
      </Text>
    </TouchableOpacity>
  )
}

type SelectableAssetItemProps = {disabled?: boolean; tokenInfo: TokenInfo; wallet: YoroiWallet}
const SelectableAssetItem = ({tokenInfo, disabled, wallet}: SelectableAssetItemProps) => {
  const {tokenSelectedChanged, amountChanged} = useSend()
  const {spendable} = useTokenQuantities(tokenInfo.id)
  const navigation = useNavigation<TxHistoryRouteNavigation>()

  const onSelect = () => {
    tokenSelectedChanged(tokenInfo.id)

    // if the balance is atomic there is no need to edit the amount
    if (Quantities.isAtomic(spendable, tokenInfo.decimals)) {
      amountChanged(spendable)
      navigation.navigate('send-list-amounts-to-send')
    } else {
      navigation.navigate('send-edit-amount')
    }
  }

  return (
    <TouchableOpacity style={styles.item} onPress={onSelect} testID="selectTokenButton" disabled={disabled}>
      <AmountItem amount={{tokenId: tokenInfo.id, quantity: spendable}} wallet={wallet} />
    </TouchableOpacity>
  )
}

export const NoAssets = () => {
  const strings = useStrings()
  return (
    <View style={styles.imageContainer}>
      <Spacer height={160} />

      <Image source={noAssetsImage} style={styles.image} />

      <Spacer height={25} />

      <Text style={styles.contentText}>{strings.noAssets}</Text>
    </View>
  )
}

const filterTokenInfosByTab = ({
  nfts,
  activeTab,
  tokenInfos,
}: {
  nfts: YoroiNft[]
  activeTab: Tabs
  tokenInfos: TokenInfo[]
}) => {
  if (activeTab === 'nfts') {
    return tokenInfos.filter((tokenInfo) => nfts.some((nft) => nft.fingerprint === tokenInfo.fingerprint))
  } else if (activeTab === 'tokens') {
    return tokenInfos.filter((tokenInfo) => !nfts.some((nft) => nft.fingerprint === tokenInfo.fingerprint))
  }

  return tokenInfos
}

const useStrings = () => {
  const intl = useIntl()

  return {
    unknownAsset: intl.formatMessage(messages.unknownAsset),
    assetsLabel: intl.formatMessage(globalMessages.assetsLabel),
    amount: intl.formatMessage(txLabels.amount),
    noAssets: intl.formatMessage(messages.noAssets),
    nfts: intl.formatMessage(globalMessages.nfts, {qty: 2}),
    tokens: intl.formatMessage(globalMessages.tokens, {qty: 2}),
    all: intl.formatMessage(globalMessages.all),
  }
}

const messages = defineMessages({
  unknownAsset: {
    id: 'components.send.assetselectorscreen.unknownAsset',
    defaultMessage: '!!!Unknown asset',
  },
  noAssets: {
    id: 'components.send.assetselectorscreen.noAssets',
    defaultMessage: '!!!No assets found',
  },
})

const styles = StyleSheet.create({
  tabs: {
    flexDirection: 'row',
  },
  tabContainer: {
    flex: 1,
  },
  tabContainerActive: {
    borderBottomColor: '#3154CB',
    borderBottomWidth: 2,
  },
  tab: {
    textAlign: 'center',
    fontWeight: 'bold',
    paddingVertical: 12,
  },
  list: {
    paddingHorizontal: 16,
    paddingTop: 9,
  },
  item: {
    paddingVertical: 9,
  },
  subheader: {
    paddingTop: 16,
    paddingHorizontal: 16,
  },
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  contentText: {
    flex: 1,
    textAlign: 'center',
    fontWeight: '700',
    fontSize: 20,
    color: '#000',
  },
  image: {
    flex: 1,
    alignSelf: 'center',
    width: 200,
    height: 228,
  },
  imageContainer: {
    flex: 1,
    textAlign: 'center',
  },
})
