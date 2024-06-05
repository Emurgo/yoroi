import {infoExtractName} from '@yoroi/portfolio'
import {useTheme} from '@yoroi/theme'
import _ from 'lodash'
import React, {ReactNode, useMemo} from 'react'
import {useIntl} from 'react-intl'
import {NativeScrollEvent, NativeSyntheticEvent, SectionList, StyleSheet, Text, View} from 'react-native'

import {Spacer} from '../../../../../../components/Spacer'
import {useSelectedWallet} from '../../../../../../features/WalletManager/context/SelectedWalletContext'
import {makeList} from '../../../../../../kernel/utils'
import {formatDateRelative} from '../../../../../../yoroi-wallets/utils/format'
import {useGetPortfolioTokenTransaction} from '../../../../common/useGetPortfolioTokenTransaction'
import {usePortfolioTokenDetailParams} from '../../../../common/useNavigateTo'
import {TransactionItem} from './TransactionItem'
import {TransactionItemSkeleton} from './TransactionItemSkeleton'

interface Props {
  onScroll: (event: NativeSyntheticEvent<NativeScrollEvent>) => void
  topContent?: ReactNode
}
export const Transactions = ({onScroll, topContent}: Props) => {
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
            {topContent}

            <Spacer height={8} />
          </>
        }
        bounces
        style={styles.scrollView}
        onScroll={onScroll}
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
      ...atoms.px_lg,
    },
    containerLoading: {
      ...atoms.flex_col,
      ...atoms.gap_xl,
      ...atoms.px_lg,
    },
    textHeader: {
      ...atoms.body_3_sm_medium,
      ...atoms.font_semibold,
      color: color.gray_c400,
    },
  })

  return {styles} as const
}
