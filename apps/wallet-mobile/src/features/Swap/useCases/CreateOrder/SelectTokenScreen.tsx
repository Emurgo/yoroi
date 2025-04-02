import {FlashList} from '@shopify/flash-list'
import {isNonNullable, isString} from '@yoroi/common'
import {amountBreakdown, isPrimaryToken, sortTokenInfos} from '@yoroi/portfolio'
import {useTheme} from '@yoroi/theme'
import {Portfolio} from '@yoroi/types'
import BigNumber from 'bignumber.js'
import React from 'react'
import {ErrorBoundary} from 'react-error-boundary'
import {StyleSheet, TouchableOpacity, View} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'

import {Boundary} from '../../../../components/Boundary/Boundary'
import {Spacer} from '../../../../components/Spacer/Spacer'
import {Text} from '../../../../components/Text'
import {useMetrics} from '../../../../kernel/metrics/metricsManager'
import {SwapTokenRoutes, useUnsafeParams} from '../../../../kernel/navigation'
import {getTokenIdParts} from '../../../Portfolio/common/helpers/get-token-id-parts'
import {usePortfolioBalances} from '../../../Portfolio/common/hooks/usePortfolioBalances'
import {usePortfolioTokenActivity} from '../../../Portfolio/common/PortfolioTokenActivityProvider'
import {AmountItemPlaceholder, TokenAmountItem} from '../../../Portfolio/common/TokenAmountItem/TokenAmountItem'
import {useSearch, useSearchOnNavBar} from '../../../Search/SearchContext'
import {NoAssetFoundImage} from '../../../Send/common/NoAssetFoundImage'
import {useSelectedWallet} from '../../../WalletManager/common/hooks/useSelectedWallet'
import {Counter} from '../../common/Counter/Counter'
import {filterBySearch} from '../../common/filterBySearch'
import {useNavigateTo} from '../../common/navigation'
import {ServiceUnavailable} from '../../common/ServiceUnavailable/ServiceUnavailable'
import {useStrings} from '../../common/strings'
import {useSwap} from '../../common/SwapProvider'
import {useSwapConfig} from '../../common/useSwapConfig'

type Direction = SwapTokenRoutes['swap-select-token']

export const SelectTokenScreen = () => {
  const strings = useStrings()
  const {styles} = useStyles()
  const {direction} = useUnsafeParams<Direction>()

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
    [styles.item],
  )

  useSearchOnNavBar({
    placeholder: strings.searchTokens,
    title: direction === 'in' ? strings.swapFrom : strings.swapTo,
  })

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <Boundary loading={loading}>
        <ErrorBoundary
          fallbackRender={({resetErrorBoundary}) => <ServiceUnavailable resetErrorBoundary={resetErrorBoundary} />}
        >
          <TokenList direction={direction} />
        </ErrorBoundary>
      </Boundary>
    </SafeAreaView>
  )
}

const TokenList = ({direction}: Direction) => {
  const strings = useStrings()
  const {styles} = useStyles()
  const {wallet} = useSelectedWallet()
  const {tokenInfos} = useSwap()
  const {search: assetSearchTerm} = useSearch()
  const balances = usePortfolioBalances({wallet})
  const {swapConfig} = useSwapConfig()
  const {tokenActivity} = usePortfolioTokenActivity()

  const ownedTokens = React.useMemo(
    () =>
      [...balances.all]
        .sort((a, b) => {
          if (isPrimaryToken(a.info)) return -1 // `a` is the PrimaryToken, so it should come first
          if (isPrimaryToken(b.info)) return 1 // `b` is the PrimaryToken, so it should come first

          // Compare based on weighted value (price * amount)
          return (tokenActivity[b.info.id]?.price.close ?? new BigNumber(0))
            .multipliedBy(amountBreakdown(b).bn)
            .comparedTo((tokenActivity[a.info.id]?.price.close ?? new BigNumber(0)).multipliedBy(amountBreakdown(a).bn))
        })
        .map(({info: {id}}) => id)
        .filter((ti) => tokenInfos.has(ti)),
    [balances.all, tokenActivity, tokenInfos],
  )
  const verifiedTokens = React.useMemo(
    () => swapConfig?.verifiedTokens?.filter((ti) => tokenInfos.has(ti)) ?? [],
    [swapConfig?.verifiedTokens, tokenInfos],
  )

  const filteredTokenList = React.useMemo(() => {
    const ownedList = ownedTokens.map((ti) => tokenInfos.get(ti)).filter(isNonNullable)

    if (direction === 'in') return [strings.yourAssets, ...ownedList].filter(filterBySearch(assetSearchTerm))

    const verifiedList = verifiedTokens
      .map((ti) => tokenInfos.get(ti))
      .filter(isNonNullable)
      .filter(({id}) => !ownedTokens.includes(id))

    return [
      strings.yourAssets,
      ...ownedList,
      strings.allAssets,
      ...verifiedList,
      ...sortTokenInfos({
        secondaryTokenInfos: Array.from(tokenInfos.values()).filter(
          ({id}) => !(ownedTokens.includes(id) || verifiedTokens.includes(id)),
        ),
        primaryTokenInfo: wallet.portfolioPrimaryTokenInfo,
      }),
    ].filter(filterBySearch(assetSearchTerm))
  }, [
    ownedTokens,
    direction,
    strings.yourAssets,
    strings.allAssets,
    wallet.portfolioPrimaryTokenInfo,
    assetSearchTerm,
    verifiedTokens,
    tokenInfos,
  ])

  return (
    <View style={styles.list}>
      <FlashList
        data={filteredTokenList}
        renderItem={({item}: {item: Portfolio.Token.Info | string}) =>
          isString(item) ? (
            <Text style={styles.sectionHeading}>{item}</Text>
          ) : (
            <Boundary loading={{fallback: <AmountItemPlaceholder style={styles.item} />}}>
              <SelectableToken
                tokenInfo={item}
                quantity={wallet.balances.records.get(item.id)?.quantity ?? 0n}
                direction={direction}
              />
            </Boundary>
          )
        }
        bounces={false}
        keyExtractor={(item) => (isString(item) ? item : `${item.name}-${item.id}`)}
        testID="assetsList"
        estimatedItemSize={72}
        ListEmptyComponent={<EmptyList />}
      />

      <Spacer height={16} />

      <Counter
        counter={filteredTokenList.length}
        style={styles.counter}
        unitsText={strings.assets(filteredTokenList.length)}
        closingText={strings.available}
      />
    </View>
  )
}

type SelectableTokenProps = Direction & {
  tokenInfo: Portfolio.Token.Info
  quantity: bigint
}
const SelectableToken = ({direction, tokenInfo, quantity}: SelectableTokenProps) => {
  const {styles} = useStyles()
  const {id, name, ticker} = tokenInfo
  // NOTE: no need to subscribe to the balance
  const {closeSearch} = useSearch()
  const swapForm = useSwap()

  const navigateTo = useNavigateTo()
  const {track} = useMetrics()

  const shouldUpdateToken =
    direction === 'in'
      ? id !== swapForm.tokenInInput.tokenId || !swapForm.tokenInInput.isTouched
      : id !== swapForm.tokenOutInput.tokenId || !swapForm.tokenOutInput.isTouched
  const shouldSwitchTokens =
    direction === 'in'
      ? id === swapForm.tokenOutInput.tokenId && swapForm.tokenOutInput.isTouched
      : id === swapForm.tokenInInput.tokenId && swapForm.tokenInInput.isTouched

  const handleOnTokenSelection = () => {
    const {policyId} = getTokenIdParts(id)

    if (direction === 'in') {
      track.swapAssetFromChanged({
        from_asset: [{asset_name: name, asset_ticker: ticker, policy_id: policyId}],
      })
    } else {
      track.swapAssetToChanged({
        to_asset: [{asset_name: name, asset_ticker: ticker, policy_id: policyId}],
      })
    }

    // useCase - switch tokens when selecting the same already selected token on the other side
    if (shouldSwitchTokens) {
      swapForm.action({type: 'ResetAmounts'})
      swapForm.action({type: 'SwitchTouched'})
    }

    if (shouldUpdateToken) {
      swapForm.action({type: direction === 'in' ? 'TokenInIdChanged' : 'TokenOutIdChanged', value: id})
      swapForm.action({type: direction === 'in' ? 'TokenInInputTouched' : 'TokenOutInputTouched'})
    }
    navigateTo.startSwap()
    closeSearch()
  }

  return (
    <TouchableOpacity style={styles.item} onPress={handleOnTokenSelection} testID="selectTokenButton">
      <TokenAmountItem amount={{info: tokenInfo, quantity}} ignorePrivacy variant="swap" />
    </TouchableOpacity>
  )
}

const EmptyList = () => {
  const {search: assetSearchTerm, visible: isSearching} = useSearch()

  if (isSearching && assetSearchTerm.length > 0) return <EmptySearchResult assetSearchTerm={assetSearchTerm} />

  return null
}

const EmptySearchResult = ({assetSearchTerm}: {assetSearchTerm: string}) => {
  const strings = useStrings()
  const {styles} = useStyles()
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

const useStyles = () => {
  const {color, atoms} = useTheme()
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: color.bg_color_max,
    },
    item: {
      paddingVertical: 8,
      paddingHorizontal: 16,
    },
    list: {
      flex: 1,
    },
    sectionHeading: {
      ...atoms.body_2_md_regular,
      color: color.text_gray_low,
      ...atoms.p_lg,
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
      ...atoms.heading_3_medium,
      fontSize: 20,
      color: color.gray_max,
      paddingTop: 4,
      textAlign: 'center',
    },
    counter: {
      paddingVertical: 16,
    },
  })

  return {styles}
}
