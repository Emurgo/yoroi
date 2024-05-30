import {useTheme} from '@yoroi/theme'
import {Portfolio} from '@yoroi/types'
import * as React from 'react'
import {FlatList, StyleSheet, Text, View} from 'react-native'

import {Spacer} from '../../../../../components'
import {useSearch} from '../../../../../features/Search/SearchContext'
import {makeList} from '../../../../../kernel/utils'
import {usePortfolioPrimaryBalance} from '../../../../Portfolio/common/hooks/usePortfolioPrimaryBalance'
import {useSelectedWallet} from '../../../../WalletManager/context/SelectedWalletContext'
import {Line} from '../../../common/Line'
import {TokenEmptyList} from '../../../common/TokenEmptyList'
import {useGetTokensWithBalance} from '../../../common/useGetTokensWithBalance'
import {useStrings} from '../../../common/useStrings'
import {TotalTokensValue} from '../TotalTokensValue/TotalTokensValue'
import {TokenBalanceItem} from './TokenBalanceItem'

export const PortfolioWalletTokenList = () => {
  const {styles} = useStyles()
  const {search, isSearching} = useSearch()

  const wallet = useSelectedWallet()
  const primaryBalance = usePortfolioPrimaryBalance({wallet})
  const {data: tokensData, isLoading: tokensLoading} = useGetTokensWithBalance()

  const getListTokens = React.useMemo(() => {
    const tokensList = tokensData ?? []

    if (isSearching) {
      return tokensList.filter((token) => token.symbol.toLowerCase().includes(search.toLowerCase()))
    }

    return tokensList
  }, [isSearching, search, tokensData])

  const renderFooterList = () => {
    if (tokensLoading) return makeList(6).map((_, index) => <SkeletonItem key={index} />)
    if (getListTokens.length === 0) return <TokenEmptyList />

    return null
  }

  return (
    <View style={styles.root}>
      <FlatList
        data={getListTokens}
        ListHeaderComponent={
          <HeadingList
            isShowBalanceCard={!isSearching}
            countTokensList={getListTokens.length}
            amount={primaryBalance}
          />
        }
        ListFooterComponent={renderFooterList}
        ItemSeparatorComponent={() => <Spacer height={16} />}
        renderItem={({item}) => <TokenBalanceItem info={item} />}
      />
    </View>
  )
}

type HeadingListProps = {
  isShowBalanceCard: boolean
  countTokensList: number
  amount: Portfolio.Token.Amount
}
const HeadingList = ({isShowBalanceCard, countTokensList, amount}: HeadingListProps) => {
  const strings = useStrings()
  const {styles} = useStyles()

  return (
    <View>
      {isShowBalanceCard ? (
        <View>
          <TotalTokensValue amount={amount} cardType="wallet" />

          <Line />
        </View>
      ) : null}

      <Spacer height={16} />

      <Text style={styles.textAvailable}>{strings.tokensAvailable(countTokensList)}</Text>

      <Spacer height={8} />
    </View>
  )
}

const SkeletonItem = () => {
  return (
    <View>
      <TokenBalanceItem />

      <Spacer height={16} />
    </View>
  )
}

const useStyles = () => {
  const {atoms, color} = useTheme()
  const styles = StyleSheet.create({
    root: {
      ...atoms.flex_1,
      ...atoms.px_lg,
      backgroundColor: color.gray_cmin,
    },
    textAvailable: {
      color: color.gray_c700,
      ...atoms.body_2_md_regular,
    },
  })

  return {styles} as const
}
