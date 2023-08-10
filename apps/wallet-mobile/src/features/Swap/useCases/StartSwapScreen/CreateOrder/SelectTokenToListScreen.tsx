import {FlashList} from '@shopify/flash-list'
import {useSwap} from '@yoroi/swap'
import {Balance} from '@yoroi/types'
import React from 'react'
import {StyleSheet, TouchableOpacity, View} from 'react-native'
import {Switch} from 'react-native-paper'

import {Boundary, Icon, Spacer, Text} from '../../../../../components'
import {AmountItem} from '../../../../../components/AmountItem/AmountItem'
import {BottomSheetModal} from '../../../../../components/BottomSheet'
import {useSearch, useSearchOnNavBar} from '../../../../../Search/SearchContext'
import {useSelectedWallet} from '../../../../../SelectedWallet'
import {COLORS} from '../../../../../theme'
import {sortTokenInfos} from '../../../../../utils'
import {YoroiWallet} from '../../../../../yoroi-wallets/cardano/types'
import {useAllTokenInfos, useBalance, useIsWalletEmpty} from '../../../../../yoroi-wallets/hooks'
import {filterByFungibility} from '../../../../Send/common/filterByFungibility'
import {NoAssetFoundImage} from '../../../../Send/common/NoAssetFoundImage'
import {filterBySearch} from '../../../common/filterBySearch'
import {useNavigateTo} from '../../../common/navigation'
import {useStrings} from '../../../common/strings'

export type FungibilityFilter = 'all' | 'ft' | 'nft'

export const SelectTokenToListScreen = () => {
  const [showInfoModal, setShowInfoModal] = React.useState(false)
  const [isSwitchOn, setIsSwitchOn] = React.useState(true)

  const strings = useStrings()
  const onToggleSwitch = () => setIsSwitchOn(!isSwitchOn)

  useSearchOnNavBar({
    placeholder: strings.searchTokens,
    title: strings.swapTo,
  })

  return (
    <View style={styles.root}>
      <View style={styles.subheader}></View>

      <Spacer height={12} />

      <View style={[styles.flex]}>
        <View style={styles.row}>
          <Icon.CheckFilled size={28} color={COLORS.SHELLEY_BLUE} />

          <Text style={styles.topText}>{strings.verifiedBy('MuseliSwap')}</Text>

          <Spacer width={8} />

          <TouchableOpacity onPress={() => setShowInfoModal(true)}>
            <Icon.Info size={24} />
          </TouchableOpacity>
        </View>

        <Switch value={isSwitchOn} onValueChange={onToggleSwitch} color={COLORS.SHELLEY_BLUE} />
      </View>

      <List />

      <BottomSheetModal
        title={strings.poolVerification('MuesliSwap')}
        content={
          <View>
            <Text style={styles.modalText}>{strings.poolVerificationInfo('MuesliSwap')}</Text>

            <Spacer height={12} />

            <Text>
              <Text style={styles.modalText}>{strings.eachVerifiedToken}</Text>

              <Spacer width={8} />

              <Icon.CheckFilled size={28} color={COLORS.SHELLEY_BLUE} />

              <Text style={styles.modalText}>{strings.verifiedBadge}</Text>
            </Text>
          </View>
        }
        isOpen={showInfoModal}
        onClose={() => setShowInfoModal(false)}
      />
    </View>
  )
}

const List = () => {
  const strings = useStrings()

  return (
    <>
      <View>
        <Spacer height={15} />

        <View style={[styles.row]}>
          <Icon.Portfolio size={20} color={COLORS.LIGHT_GREEN} />

          <Spacer width={8} />

          <Text style={styles.topText}>{strings.assetsIn}</Text>
        </View>
      </View>

      <Spacer height={24} />

      <AssetList />
    </>
  )
}

const AssetList = () => {
  const wallet = useSelectedWallet()
  const tokenInfos = useAllTokenInfos({wallet})
  const filteredTokenInfos = useFilteredTokenInfos({tokenInfos})

  return (
    <View style={styles.list}>
      <FlashList
        data={filteredTokenInfos}
        renderItem={({item: tokenInfo}: {item: Balance.TokenInfo}) => (
          <Boundary>
            <SelectableAssetItem
              tokenInfo={tokenInfo}
              disabled={tokenInfo.id !== wallet.primaryTokenInfo.id}
              wallet={wallet}
            />
          </Boundary>
        )}
        bounces={false}
        keyExtractor={(_, index) => index.toString()}
        testID="assetsList"
        estimatedItemSize={78}
        ListEmptyComponent={<ListEmptyComponent filteredTokenInfos={filteredTokenInfos} allTokenInfos={tokenInfos} />}
      />

      <Counter counter={filteredTokenInfos.length} />
    </View>
  )
}

type SelectableAssetItemProps = {disabled?: boolean; tokenInfo: Balance.TokenInfo; wallet: YoroiWallet}
const SelectableAssetItem = ({tokenInfo, wallet}: SelectableAssetItemProps) => {
  const {closeSearch} = useSearch()
  const {buyAmountChanged} = useSwap()
  const navigateTo = useNavigateTo()
  const isPrimary = tokenInfo.id === wallet.primaryTokenInfo.id
  const balanceAvailable = useBalance({wallet, tokenId: tokenInfo.id})

  const onSelect = () => {
    buyAmountChanged({tokenId: tokenInfo.id, quantity: balanceAvailable})
    navigateTo.swapTokens()
    closeSearch()
  }

  return (
    <TouchableOpacity
      style={[styles.item, isPrimary && styles.borderBottom]}
      onPress={onSelect}
      testID="selectTokenButton"
    >
      <AmountItem amount={{tokenId: tokenInfo.id, quantity: balanceAvailable}} wallet={wallet} variant="swap" />
    </TouchableOpacity>
  )
}

const Counter = ({counter}: {counter: number}) => {
  const {search: assetSearchTerm, visible: isSearching} = useSearch()
  const strings = useStrings()

  if (!isSearching) {
    return (
      <View style={styles.counter}>
        <Text style={styles.counterText}>{strings.youHave}</Text>

        <Text style={styles.counterTextBold}>{` ${counter} ${strings.tokens(counter)}`}</Text>
      </View>
    )
  }

  if (isSearching && assetSearchTerm.length > 0) {
    return (
      <View style={styles.counter}>
        <Text style={styles.counterTextBold}>{`${counter} ${strings.assets(counter)} `}</Text>

        <Text style={styles.counterText}>{strings.found}</Text>
      </View>
    )
  }

  return null
}

const useFilteredTokenInfos = ({tokenInfos}: {tokenInfos: Array<Balance.TokenInfo>}) => {
  const wallet = useSelectedWallet()
  const {search: assetSearchTerm, visible: isSearching} = useSearch()
  const isWalletEmpty = useIsWalletEmpty(wallet)

  if (isWalletEmpty && !isSearching && tokenInfos?.length === 0) return []

  const filteredTokenInfos = tokenInfos.filter(filterBySearch(assetSearchTerm)).filter(
    filterByFungibility({
      fungibilityFilter: 'ft',
    }),
  )

  return sortTokenInfos({
    wallet,
    tokenInfos: filteredTokenInfos,
  })
}

const ListEmptyComponent = ({
  filteredTokenInfos,
  allTokenInfos,
}: {
  filteredTokenInfos: Array<Balance.TokenInfo>
  allTokenInfos: Array<Balance.TokenInfo>
}) => {
  const {search: assetSearchTerm, visible: isSearching} = useSearch()

  if ((isSearching && assetSearchTerm.length > 0 && filteredTokenInfos.length === 0) || allTokenInfos.length === 0)
    return <EmptySearchResult />

  return null
}

const EmptySearchResult = () => {
  const strings = useStrings()
  return (
    <View style={styles.imageContainer}>
      <Spacer height={50} />

      <NoAssetFoundImage style={styles.image} />

      <Spacer height={25} />

      <Text style={styles.contentText}>{strings.noAssetsFound}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: 'white',
    paddingHorizontal: 16,
  },
  subheader: {
    paddingHorizontal: 16,
  },
  item: {
    paddingVertical: 14,
  },
  borderBottom: {
    borderBottomColor: COLORS.BORDER_GRAY,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  list: {
    flex: 1,
  },

  counter: {
    padding: 16,
    justifyContent: 'center',
    flexDirection: 'row',
  },
  counterText: {
    fontWeight: '400',
    color: COLORS.SHELLEY_BLUE,
  },
  counterTextBold: {
    fontWeight: 'bold',
    color: COLORS.SHELLEY_BLUE,
  },
  flex: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  topText: {
    fontSize: 16,
  },
  modalText: {
    fontWeight: '400',
    lineHeight: 20,
    color: '#242838',
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
    fontWeight: '500',
    fontSize: 20,
    color: '#000',
    paddingTop: 4,
  },
})
