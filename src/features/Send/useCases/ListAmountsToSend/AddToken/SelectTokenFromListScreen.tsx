import {useNavigation} from '@react-navigation/native'
import {FlashList} from '@shopify/flash-list'
import React from 'react'
import {Image, StyleSheet, TouchableOpacity, View} from 'react-native'

import noAssetsImage from '../../../../../assets/img/no-assets-found.png'
import {Boundary, Spacer, Text} from '../../../../../components'
import {AmountItem} from '../../../../../components/AmountItem/AmountItem'
import {NftImageGallery} from '../../../../../components/NftImageGallery'
import {TxHistoryRouteNavigation} from '../../../../../navigation'
import {useSearch, useSearchOnNavBar} from '../../../../../Search/SearchContext'
import {useSelectedWallet} from '../../../../../SelectedWallet/Context/SelectedWalletContext'
import {sortTokenInfos} from '../../../../../utils'
import {YoroiWallet} from '../../../../../yoroi-wallets/cardano/types'
import {limitOfSecondaryAmountsPerTx} from '../../../../../yoroi-wallets/contants'
import {useBalances, useNfts, useTokenInfos} from '../../../../../yoroi-wallets/hooks'
import {TokenInfo, YoroiNft} from '../../../../../yoroi-wallets/types'
import {Amounts, Quantities} from '../../../../../yoroi-wallets/utils'
import {filterTokenInfos} from '../../../common/filterTokenInfos'
import {useSelectedSecondaryAmountsCounter, useSend, useTokenQuantities} from '../../../common/SendContext'
import {useStrings} from '../../../common/strings'
import {MaxAmountsPerTx} from './Show/MaxAmountsPerTx'

export type Tabs = 'all' | 'tokens' | 'nfts'

export const SelectTokenFromListScreen = () => {
  const [activeTab, setActiveTab] = React.useState<Tabs>('all')
  const strings = useStrings()

  // use case: search listed tokens
  useSearchOnNavBar({
    placeholder: strings.searchTokens,
    title: strings.selecteAssetTitle,
  })

  const wallet = useSelectedWallet()

  const {nfts} = useNfts(wallet)

  const secondaryAmountsCounter = useSelectedSecondaryAmountsCounter(wallet)

  const {inputSearchVisible} = useSearch()

  const onSelectNft = useOnSelectNft()

  const canAddAmount = secondaryAmountsCounter < limitOfSecondaryAmountsPerTx
  const isNftListVisible = activeTab === 'nfts' && !inputSearchVisible

  return (
    <View style={styles.root}>
      <View style={styles.subheader}>
        {!inputSearchVisible && <Tabs activeTab={activeTab} setActiveTab={setActiveTab} />}

        {!canAddAmount && (
          <View style={styles.panel}>
            <MaxAmountsPerTx />

            <Spacer height={16} />
          </View>
        )}
      </View>

      {isNftListVisible ? (
        <NftList nfts={nfts} onSelect={onSelectNft} />
      ) : (
        <NoNftList activeTab={activeTab} nfts={nfts} wallet={wallet} canAddToken={canAddAmount} />
      )}
    </View>
  )
}

type NftList = {
  nfts: YoroiNft[]
  onSelect: (nftId: string) => void
}

const NftList = ({nfts, onSelect}: NftList) => {
  return (
    <View style={styles.nftList}>
      <NftImageGallery nfts={nfts} onRefresh={() => null} onSelect={onSelect} isRefreshing={false} bounces={false} />
    </View>
  )
}

type NoNftList = {
  nfts: YoroiNft[]
  wallet: YoroiWallet
  canAddToken: boolean
  activeTab: Tabs
}

const NoNftList = ({wallet, canAddToken, activeTab}: NoNftList) => {
  const {search: assetSearchTerm} = useSearch()
  const filteredTokenInfos = useFilteredTokenInfos({activeTab})

  return (
    <View style={styles.noNftList}>
      <FlashList
        data={filteredTokenInfos}
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
        ListEmptyComponent={assetSearchTerm.length > 0 && filteredTokenInfos.length === 0 ? <NoAssets /> : undefined}
      />
    </View>
  )
}

const useFilteredTokenInfos = ({activeTab}: {activeTab: Tabs}) => {
  const wallet = useSelectedWallet()
  const {nfts} = useNfts(wallet)
  const {search: assetSearchTerm, inputSearchVisible} = useSearch()
  const balances = useBalances(wallet)

  const tokenInfos = useTokenInfos({
    wallet,
    tokenIds: Amounts.toArray(balances).map(({tokenId}) => tokenId),
  })

  const searchFilteredTokens = filterTokenInfos(assetSearchTerm, tokenInfos)

  const tabFilteredTokenInfos = filterTokenInfosByTab({
    nfts,
    activeTab: inputSearchVisible ? 'all' : activeTab,
    tokenInfos: searchFilteredTokens,
  })

  const sortedFilteredTokenInfos = sortTokenInfos({
    wallet,
    tokenInfos: tabFilteredTokenInfos,
  })

  return sortedFilteredTokenInfos
}

const Tabs = ({setActiveTab, activeTab}: {setActiveTab: (activeTab: Tabs) => void; activeTab: Tabs}) => {
  const strings = useStrings()

  return (
    <View style={styles.tabs}>
      <Tab activeTab={activeTab} setActiveTab={setActiveTab} text={strings.all} tab="all" />

      <Tab activeTab={activeTab} setActiveTab={setActiveTab} text={strings.tokens(2)} tab="tokens" />

      <Tab activeTab={activeTab} setActiveTab={setActiveTab} text={strings.nfts(2)} tab="nfts" />
    </View>
  )
}

type Tab = {
  setActiveTab: (activeTab: Tabs) => void
  activeTab: Tabs
  tab: Tabs
  text: string
}

const Tab = ({setActiveTab, activeTab, tab, text}: Tab) => (
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

type SelectableAssetItemProps = {disabled?: boolean; tokenInfo: TokenInfo; wallet: YoroiWallet}
const SelectableAssetItem = ({tokenInfo, disabled, wallet}: SelectableAssetItemProps) => {
  const {tokenSelectedChanged, amountChanged} = useSend()
  const {spendable} = useTokenQuantities(tokenInfo.id)
  const navigation = useNavigation<TxHistoryRouteNavigation>()

  const isPrimary = tokenInfo.id === wallet.primaryTokenInfo.id

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
    <TouchableOpacity
      style={[styles.item, isPrimary && styles.borderBottom]}
      onPress={onSelect}
      testID="selectTokenButton"
      disabled={disabled}
    >
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

const useOnSelectNft = () => {
  const navigation = useNavigation<TxHistoryRouteNavigation>()
  const {tokenSelectedChanged, amountChanged} = useSend()

  const onSelectNft = (nftId) => {
    tokenSelectedChanged(nftId)
    amountChanged('1')
    navigation.navigate('send-list-amounts-to-send')
  }

  return onSelectNft
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

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: 'white',
  },
  subheader: {
    paddingHorizontal: 16,
  },
  item: {
    paddingVertical: 14,
  },
  borderBottom: {
    borderBottomColor: '#DCE0E9',
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  panel: {
    paddingTop: 16,
  },
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
  nftList: {
    paddingTop: 18,
    flex: 1,
  },
  noNftList: {
    flex: 1,
  },
  list: {
    paddingHorizontal: 16,
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
  contentText: {
    flex: 1,
    textAlign: 'center',
    fontWeight: '700',
    fontSize: 20,
    color: '#000',
  },
})
