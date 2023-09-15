import {FlashList} from '@shopify/flash-list'
import {useSwap, useSwapTokensByPairToken} from '@yoroi/swap'
import {Balance} from '@yoroi/types'
import React from 'react'
import {StyleSheet, TouchableOpacity, View} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'

import {Boundary, Icon, Spacer, Text} from '../../../../../../../components'
import {AmountItem, AmountItemPlaceholder} from '../../../../../../../components/AmountItem/AmountItem'
import {useMetrics} from '../../../../../../../metrics/metricsManager'
import {useSearch, useSearchOnNavBar} from '../../../../../../../Search/SearchContext'
import {useSelectedWallet} from '../../../../../../../SelectedWallet'
import {COLORS} from '../../../../../../../theme'
import {YoroiWallet} from '../../../../../../../yoroi-wallets/cardano/types'
import {useAllTokenInfos, useBalance} from '../../../../../../../yoroi-wallets/hooks'
import {asQuantity, Quantities} from '../../../../../../../yoroi-wallets/utils'
import {filterByFungibility} from '../../../../../../Send/common/filterByFungibility'
import {NoAssetFoundImage} from '../../../../../../Send/common/NoAssetFoundImage'
import {filterBySearch} from '../../../../../common/filterBySearch'
import {useNavigateTo} from '../../../../../common/navigation'
import {useStrings} from '../../../../../common/strings'
import {useSwapTouched} from '../../../../../common/SwapFormProvider'

type TokenForList = {
  supply: Balance.TokenSupply['total']
  status: Balance.TokenStatus
} & Balance.TokenInfo & {
    inUserWallet: boolean
  }

export const SelectBuyTokenFromListScreen = () => {
  const strings = useStrings()

  useSearchOnNavBar({
    placeholder: strings.searchTokens,
    title: strings.swapTo,
  })

  const loading = React.useMemo(
    () => ({
      fallback: (
        <View
          style={{
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {Array.from({length: 6}).map((_, i) => (
            <AmountItemPlaceholder key={i} style={styles.item} />
          ))}
        </View>
      ),
    }),
    [],
  )

  return (
    <SafeAreaView style={styles.container}>
      <Spacer height={12} />

      <View style={[styles.row, styles.ph]}>
        <Icon.Portfolio size={20} color={COLORS.LIGHT_GREEN} />

        <Spacer width={8} />

        <Text style={styles.topText}>{strings.assetsIn}</Text>
      </View>

      <Boundary loading={loading}>
        <TokenList />
      </Boundary>
    </SafeAreaView>
  )
}

const TokenList = () => {
  const strings = useStrings()
  const wallet = useSelectedWallet()
  const tokenInfos = useAllTokenInfos({wallet})
  const {pairsByToken} = useSwapTokensByPairToken('')
  const walletTokenInfos = React.useMemo(
    () =>
      tokenInfos.filter(
        filterByFungibility({
          fungibilityFilter: 'ft',
        }),
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [tokenInfos?.length],
  )

  const {search: assetSearchTerm} = useSearch()

  const tokens: TokenForList[] = React.useMemo(
    () => {
      if (pairsByToken === undefined) return []

      const walletTokenIds = new Set(walletTokenInfos.map((walletToken) => walletToken.id))
      const asTokenForList = (token: Balance.Token) => {
        const {decimals, description, fingerprint, group, icon, id, image, kind, metadatas, name, symbol, ticker} =
          token.info
        const supplyFormatted = Quantities.format(asQuantity(token.supply?.total), decimals ?? 0)

        return {
          // info
          decimals,
          description,
          fingerprint,
          group,
          icon,
          id,
          image,
          kind,
          metadatas,
          name,
          symbol,
          ticker,

          supply: supplyFormatted,

          status: token.status,

          // custom
          inUserWallet: walletTokenIds.has(id),
        }
      }
      return pairsByToken.map(asTokenForList).filter((token) => token.status === 'verified') // TODO: check I think we can drop it
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [pairsByToken?.length, walletTokenInfos?.length],
  )

  const filteredTransformedList = React.useMemo(() => {
    return tokens.filter(filterBySearch(assetSearchTerm))
  }, [tokens, assetSearchTerm])

  return (
    <View style={styles.list}>
      {filteredTransformedList?.length > 0 && (
        <View style={styles.ph}>
          <Spacer height={16} />

          <View style={styles.labels}>
            <Text style={styles.label}>{strings.asset}</Text>

            <Text style={styles.label}>{strings.volume}</Text>
          </View>

          <Spacer height={16} />

          <View style={styles.line} />
        </View>
      )}

      <FlashList
        data={filteredTransformedList}
        renderItem={({item: tokenForList}: {item: TokenForList}) => (
          <Boundary loading={{fallback: <AmountItemPlaceholder style={styles.item} />}}>
            <SelectableToken
              tokenForList={tokenForList}
              disabled={tokenForList.id !== wallet.primaryTokenInfo.id}
              wallet={wallet}
            />
          </Boundary>
        )}
        bounces={false}
        keyExtractor={({id, name}) => `${name}-${id}`}
        testID="assetsList"
        estimatedItemSize={72}
        ListEmptyComponent={<EmptyList filteredTokensForList={filteredTransformedList} allTokenInfos={tokenInfos} />}
      />

      <Counter counter={filteredTransformedList.length} />
    </View>
  )
}

type SelectableTokenProps = {disabled?: boolean; tokenForList: TokenForList; wallet: YoroiWallet}
const SelectableToken = ({tokenForList, wallet}: SelectableTokenProps) => {
  const {closeSearch} = useSearch()
  const {buyAmountChanged} = useSwap()
  const {buyTouched} = useSwapTouched()

  const navigateTo = useNavigateTo()
  const balanceAvailable = useBalance({wallet, tokenId: tokenForList.id})
  const {track} = useMetrics()

  const onSelect = () => {
    track.swapAssetToChanged({
      to_asset: [{asset_name: tokenForList.name, asset_ticker: tokenForList.ticker, policy_id: tokenForList.group}],
    })
    buyTouched()
    buyAmountChanged({tokenId: tokenForList.id, quantity: balanceAvailable})
    navigateTo.startSwap()
    closeSearch()
  }

  return (
    <TouchableOpacity style={styles.item} onPress={onSelect} testID="selectTokenButton">
      <AmountItem
        amount={{tokenId: tokenForList.id, quantity: balanceAvailable}}
        wallet={wallet}
        status={tokenForList.status}
        inWallet={tokenForList.inUserWallet}
        supply={tokenForList?.supply}
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
  filteredTokensForList,
  allTokenInfos,
}: {
  filteredTokensForList: Array<TokenForList>
  allTokenInfos: Array<Balance.TokenInfo>
}) => {
  const {search: assetSearchTerm, visible: isSearching} = useSearch()

  if ((isSearching && assetSearchTerm.length > 0 && filteredTokensForList.length === 0) || allTokenInfos.length === 0)
    return <EmptySearchResult assetSearchTerm={assetSearchTerm} />

  return null
}

const EmptySearchResult = ({assetSearchTerm}: {assetSearchTerm: string}) => {
  const strings = useStrings()
  return (
    <View style={styles.imageContainer}>
      <Spacer height={50} />

      <NoAssetFoundImage style={styles.image} />

      <Spacer height={25} />

      <Text style={styles.contentText}>
        {assetSearchTerm === '' ? strings.noAssetsFound : strings.noAssetsFoundFor(assetSearchTerm)}
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  ph: {
    paddingHorizontal: 16,
  },
  item: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  label: {
    fontFamily: 'Rubik',
    fontSize: 12,
    fontStyle: 'normal',
    fontWeight: '400',
    lineHeight: 18,
  },
  labels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  list: {
    flex: 1,
  },
  line: {
    height: 1,
    backgroundColor: COLORS.BORDER_GRAY,
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
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  topText: {
    fontSize: 16,
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
    fontFamily: 'Rubik-Medium',
    fontSize: 20,
    color: '#000',
    paddingTop: 4,
  },
})
