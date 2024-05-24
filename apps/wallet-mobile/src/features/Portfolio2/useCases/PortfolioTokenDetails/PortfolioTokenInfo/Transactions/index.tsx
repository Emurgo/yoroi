/* eslint-disable react-native/no-raw-text */
import {useTheme} from '@yoroi/theme'
import _ from 'lodash'
import React, {useMemo} from 'react'
import {useIntl} from 'react-intl'
import {SafeAreaView, SectionList, StyleSheet, Text, View} from 'react-native'

import {Spacer} from '../../../../../../components/Spacer'
import {formatDateRelative} from '../../../../../../legacy/format'
import {makeList} from '../../../../../../utils'
import {useGetPortfolioTokenTransaction} from '../../../../common/useGetPortfolioTokenTransaction'
import {usePortfolioTokenDetailParams} from '../../../../common/useNavigationTo'
import {TransactionItem} from './TransactionItem'
import {TransactionItemSkeleton} from './TransactionItemSkeleton'

export const Transactions = () => {
  const {styles} = useStyles()
  const {name: tokenName} = usePortfolioTokenDetailParams()
  const {data, isLoading} = useGetPortfolioTokenTransaction(tokenName)

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
    <SafeAreaView style={styles.root}>
      <SectionList
        // We disabled the scroll because we already have one on the root screen
        scrollEnabled={false}
        nestedScrollEnabled={true}
        sections={groupedData}
        keyExtractor={(_, index) => index.toString()}
        renderItem={({item, index}) => <TransactionItem key={item?.id ?? index} tx={item} tokenName={tokenName} />}
        ItemSeparatorComponent={() => <Spacer height={24} />}
        SectionSeparatorComponent={() => <Spacer height={16} />}
        renderSectionHeader={({section: {title}}) => <Text style={styles.textHeader}>{title}</Text>}
        onEndReached={loadMoreItems}
        onEndReachedThreshold={0.5} // Trigger the load more half-way to the bottom
      />

      {isLoading ? (
        <View style={styles.containerLoading}>
          {makeList(3).map((_, index) => (
            <TransactionItemSkeleton key={index} />
          ))}
        </View>
      ) : null}
    </SafeAreaView>
  )
}

const useStyles = () => {
  const {atoms, color} = useTheme()
  const styles = StyleSheet.create({
    root: {
      ...atoms.flex_1,
      backgroundColor: color.gray_cmin,
    },
    containerLoading: {
      ...atoms.flex_col,
      ...atoms.gap_xl,
    },
    textHeader: {
      ...atoms.body_3_sm_medium,
      ...atoms.font_semibold,
      color: color.gray_c400,
    },
  })

  return {styles} as const
}
