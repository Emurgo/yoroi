import {FlashList} from '@shopify/flash-list'
import {usePairListByToken, useSwap} from '@yoroi/swap'
import {Balance} from '@yoroi/types'
import React from 'react'
import {StyleSheet, TouchableOpacity, View} from 'react-native'
import {Switch} from 'react-native-paper'
import {SafeAreaView} from 'react-native-safe-area-context'

import {Boundary, Icon, Spacer, Text} from '../../../../../../../components'
import {AmountItem} from '../../../../../../../components/AmountItem/AmountItem'
import {BottomSheetModal} from '../../../../../../../components/BottomSheet'
import {useSearch, useSearchOnNavBar} from '../../../../../../../Search/SearchContext'
import {useSelectedWallet} from '../../../../../../../SelectedWallet'
import {COLORS} from '../../../../../../../theme'
import {YoroiWallet} from '../../../../../../../yoroi-wallets/cardano/types'
import {useAllTokenInfos, useBalance} from '../../../../../../../yoroi-wallets/hooks'
import {Quantities} from '../../../../../../../yoroi-wallets/utils'
import {filterByFungibility} from '../../../../../../Send/common/filterByFungibility'
import {NoAssetFoundImage} from '../../../../../../Send/common/NoAssetFoundImage'
import {useNavigateTo} from '../../../../../common/navigation'
import {useStrings} from '../../../../../common/strings'
import {useSwapTouched} from '../../TouchedContext'

type TransformedObject = {
  decimals: number | undefined
  description: string | undefined
  fingerprint: string
  group: string
  icon: string | undefined
  id: string
  image: string | undefined
  kind: string
  name: string
  symbol: string | undefined
  ticker: string | undefined
  status: string
  supply: string
  inUserWallet: boolean
}

export const SelectBuyTokenFromListScreen = () => {
  const [isOnlyVerifiedTokens, setIsOnlyVerifiedTokens] = React.useState(true)

  const strings = useStrings()
  const handleToogleIsOnlyVerified = () => setIsOnlyVerifiedTokens(!isOnlyVerifiedTokens)

  useSearchOnNavBar({
    placeholder: strings.searchTokens,
    title: strings.swapTo,
  })

  return (
    <SafeAreaView style={styles.container}>
      <Spacer height={12} />

      <VerifiedTokensToogle onToogle={handleToogleIsOnlyVerified} isToogled={isOnlyVerifiedTokens} />

      <Spacer height={15} />

      <MyPortfolioCaption />

      <Spacer height={24} />

      <Boundary>
        <TokenList showOnlyVerifiedTokens={isOnlyVerifiedTokens} />
      </Boundary>
    </SafeAreaView>
  )
}

const VerifiedTokensToogle = ({onToogle, isToogled}: {onToogle: () => void; isToogled: boolean}) => {
  const strings = useStrings()
  const [showVerifiedTokenInfo, setShowVerifiedTokenInfo] = React.useState(false)

  return (
    <View style={styles.flex}>
      <View style={styles.row}>
        <Icon.CheckFilled size={28} color={COLORS.SHELLEY_BLUE} />

        <Text style={styles.topText}>{strings.verifiedBy('MuseliSwap')}</Text>

        <Spacer width={8} />

        <TouchableOpacity onPress={() => setShowVerifiedTokenInfo(true)}>
          <Icon.Info size={24} />
        </TouchableOpacity>
      </View>

      <Switch value={isToogled} onValueChange={onToogle} color={COLORS.SHELLEY_BLUE} />

      <BottomSheetModal
        title={strings.poolVerification('MuesliSwap')}
        content={<VerifiedTokenInfo />}
        isOpen={showVerifiedTokenInfo}
        onClose={() => setShowVerifiedTokenInfo(false)}
      />
    </View>
  )
}

const VerifiedTokenInfo = () => {
  const strings = useStrings()
  return (
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
  )
}

const MyPortfolioCaption = () => {
  const strings = useStrings()

  return (
    <View>
      <View style={[styles.row]}>
        <Icon.Portfolio size={20} color={COLORS.LIGHT_GREEN} />

        <Spacer width={8} />

        <Text style={styles.topText}>{strings.assetsIn}</Text>
      </View>
    </View>
  )
}

type TokenListProps = {
  showOnlyVerifiedTokens: boolean
}

const TokenList = ({showOnlyVerifiedTokens}: TokenListProps) => {
  const wallet = useSelectedWallet()
  const tokenInfos = useAllTokenInfos({wallet})
  const {pairsByToken} = usePairListByToken('')
  const walletTokenInfos = tokenInfos.filter(
    filterByFungibility({
      fungibilityFilter: 'ft',
    }),
  )
  const {search: assetSearchTerm} = useSearch()
  const secondArray = walletTokenInfos

  const transformedArray: TransformedObject[] =
    pairsByToken !== undefined
      ? pairsByToken
          .map((item) => {
            const matchingSecondItem = secondArray.find((secondItem) => secondItem.id === item.info.id)
            return {
              decimals: item.info.decimals,
              description: item.info.description,
              fingerprint: item.info.fingerprint,
              group: item.info.group,
              icon: item.info.icon,
              id: item.info.id,
              image: item.info.image,
              kind: item.info.kind,
              metadatas: item.info.metadatas,
              name: item.info.name,
              symbol: item.info.symbol,
              ticker: item.info.ticker,
              status: item.status,
              supply: Quantities.denominated(`${Number(item.supply.total)}`, item.info.decimals ?? 0),
              inUserWallet: !!matchingSecondItem,
            }
          })
          .filter((item) => (showOnlyVerifiedTokens ? item.status === 'verified' : item))
      : []

  const filteredTransformedList = transformedArray.filter(filterTokensPairBySearch(assetSearchTerm))

  return (
    <View style={styles.list}>
      <FlashList
        data={filteredTransformedList}
        renderItem={({item: tokenInfo}: {item: TransformedObject}) => (
          <Boundary>
            <SelectableToken
              tokenInfo={tokenInfo}
              disabled={tokenInfo.id !== wallet.primaryTokenInfo.id}
              wallet={wallet}
            />
          </Boundary>
        )}
        bounces={false}
        keyExtractor={({id}) => id}
        testID="assetsList"
        estimatedItemSize={78}
        ListEmptyComponent={<EmptyList filteredTokenInfos={filteredTransformedList} allTokenInfos={tokenInfos} />}
      />

      <Counter counter={filteredTransformedList.length} />
    </View>
  )
}

type SelectableTokenProps = {disabled?: boolean; tokenInfo: TransformedObject; wallet: YoroiWallet}
const SelectableToken = ({tokenInfo, wallet}: SelectableTokenProps) => {
  const {closeSearch} = useSearch()
  const {buyAmountChanged} = useSwap()
  const {buyTouched} = useSwapTouched()

  const navigateTo = useNavigateTo()
  const isPrimary = tokenInfo.id === wallet.primaryTokenInfo.id
  const balanceAvailable = useBalance({wallet, tokenId: tokenInfo.id})

  const onSelect = () => {
    buyTouched()
    buyAmountChanged({tokenId: tokenInfo.id, quantity: balanceAvailable})
    navigateTo.startSwap()
    closeSearch()
  }

  return (
    <TouchableOpacity
      style={[styles.item, isPrimary && styles.borderBottom]}
      onPress={onSelect}
      testID="selectTokenButton"
    >
      <AmountItem
        amount={{tokenId: tokenInfo.id, quantity: balanceAvailable}}
        wallet={wallet}
        status={tokenInfo.status}
        inWallet={tokenInfo.inUserWallet}
        supply={tokenInfo?.supply}
        variant="swap"
      />
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

const EmptyList = ({
  filteredTokenInfos,
  allTokenInfos,
}: {
  filteredTokenInfos: Array<TransformedObject>
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

export const filterTokensPairBySearch = (searchTerm: string) => {
  const searchTermLowerCase = searchTerm.toLocaleLowerCase()
  if (searchTermLowerCase.length === 0) return () => true

  return (tokenInfo: TransformedObject) => {
    return tokenInfo.name?.toLocaleLowerCase().includes(searchTermLowerCase) ?? false
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
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
