import {infoExtractName} from '@yoroi/portfolio'
import {useTheme} from '@yoroi/theme'
import _ from 'lodash'
import React, {useMemo} from 'react'
import {useIntl} from 'react-intl'
import {SectionList, SectionListProps, StyleSheet, Text, View} from 'react-native'

import {Spacer} from '../../../../../../components/Spacer'
import {makeList} from '../../../../../../kernel/utils'
import {formatDateRelative} from '../../../../../../yoroi-wallets/utils/format'
import {useSelectedWallet} from '../../../../../WalletManager/context/SelectedWalletContext'
import {ITokenTransaction, useGetPortfolioTokenTransaction} from '../../../../common/useGetPortfolioTokenTransaction'
import {usePortfolioTokenDetailParams} from '../../../../common/useNavigateTo'
import {TransactionItem} from './TransactionItem'
import {TransactionItemSkeleton} from './TransactionItemSkeleton'

export const Transactions = () => {
  const {styles} = useStyles()
  const {id: tokenId} = usePortfolioTokenDetailParams()
  const wallet = useSelectedWallet()
  const {balances} = wallet
  const tokenInfo = balances.records.get(tokenId)
  const name = tokenInfo?.info ? infoExtractName(tokenInfo.info) : ''
  const {data, isLoading} = useGetPortfolioTokenTransaction(name)

  const intl = useIntl()

  const groupedData = useMemo(() => {
    if (!data) return []

    return _.chain(data)
      .groupBy((t) => {
        const submittedAt = new Date(t.submittedAt)
        submittedAt.setHours(0, 0, 0, 0) // set the time to 00:00:00 for grouping by day
        return submittedAt.toISOString()
      })
      .map((data, title) => ({
        title: formatDateRelative(title, intl, {year: 'numeric', month: 'short', day: 'numeric'}),
        data,
      }))
      .value()
  }, [data, intl])

  // TODO: implement load more when API ready
  const loadMoreItems = () => {
    console.log('load more')
  }

  return (
    <View style={styles.root}>
      {isLoading ? (
        <View style={styles.containerLoading}>
          {makeList(6).map((_, index) => (
            <TransactionItemSkeleton key={index} />
          ))}
        </View>
      ) : null}

      <SectionList
        ListHeaderComponent={
          <>
            <Spacer height={8} />
          </>
        }
        bounces
        style={styles.scrollView}
        scrollEventThrottle={16}
        sections={groupedData}
        keyExtractor={(_, index) => index.toString()}
        renderItem={({item, index}) => <TransactionItem key={item?.id ?? index} tx={item} tokenName={name} />}
        ItemSeparatorComponent={() => <Spacer height={24} />}
        SectionSeparatorComponent={() => <Spacer height={16} />}
        renderSectionHeader={({section: {title}}) => <Text style={styles.textHeader}>{title}</Text>}
        stickySectionHeadersEnabled={false}
        onEndReached={loadMoreItems}
        onEndReachedThreshold={0.5} // Trigger the load more half-way to the bottom
      />
    </View>
  )
}

export const useTokenDetailTransactions = ({active}: {active?: boolean}) => {
  const {styles} = useStyles()
  const {id: tokenId} = usePortfolioTokenDetailParams()
  const wallet = useSelectedWallet()
  const {balances} = wallet
  const tokenInfo = balances.records.get(tokenId)
  const name = tokenInfo?.info ? infoExtractName(tokenInfo.info) : ''
  const {data, isLoading} = useGetPortfolioTokenTransaction(name, {
    enabled: active,
  })
  const intl = useIntl()

  const groupedData = useMemo(() => {
    if (!data) return []

    return _.chain(data)
      .groupBy((t) => {
        const submittedAt = new Date(t.submittedAt)
        submittedAt.setHours(0, 0, 0, 0) // set the time to 00:00:00 for grouping by day
        return submittedAt.toISOString()
      })
      .map((data, title) => ({
        title: formatDateRelative(title, intl, {year: 'numeric', month: 'short', day: 'numeric'}),
        data,
      }))
      .value()
  }, [data, intl])

  // TODO: implement load more when API ready
  const loadMoreItems = () => {
    console.log('load more')
  }

  const getSectionListProps: SectionListProps<ITokenTransaction> = useMemo(() => {
    if (!active) {
      return {
        sections: [],
      }
    }

    return {
      sections: groupedData,
      renderSectionHeader: ({section: {title}}) => <Text style={styles.textHeader}>{title}</Text>,
      ItemSeparatorComponent: () => <Spacer height={24} />,
      SectionSeparatorComponent: () => <Spacer height={16} />,
      keyExtractor: (_, index) => index.toString(),
      renderItem: ({item, index}) => (
        <View style={styles.containerItem}>
          <TransactionItem key={item?.id ?? index} tx={item} tokenName={name} />
        </View>
      ),
      stickySectionHeadersEnabled: false,
      onEndReached: loadMoreItems,
      onEndReachedThreshold: 0.5, // Trigger the load more half-way to the bottom
    }
  }, [active, groupedData, name, styles.containerItem, styles.textHeader])

  const loadingView = useMemo(() => {
    if (!active) return null
    return isLoading ? (
      <View style={styles.containerLoading}>
        {makeList(6).map((_, index) => (
          <TransactionItemSkeleton key={index} />
        ))}
      </View>
    ) : null
  }, [active, isLoading, styles.containerLoading])

  return {
    getSectionListProps,
    loadingView,
  }
}

const useStyles = () => {
  const {atoms, color} = useTheme()
  const styles = StyleSheet.create({
    root: {
      ...atoms.flex_1,
      ...atoms.flex_col,
      backgroundColor: color.gray_cmin,
    },
    scrollView: {
      ...atoms.flex_1,
    },
    containerLoading: {
      ...atoms.flex_col,
      ...atoms.gap_xl,
      ...atoms.px_lg,
    },
    containerItem: {
      ...atoms.px_lg,
    },
    textHeader: {
      ...atoms.body_3_sm_medium,
      ...atoms.font_semibold,
      color: color.gray_c400,
      ...atoms.px_lg,
    },
  })

  return {styles} as const
}
