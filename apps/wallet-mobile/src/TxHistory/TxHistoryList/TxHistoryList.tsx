import {useFocusEffect, useNavigation} from '@react-navigation/native'
import {isString} from '@yoroi/common'
import {BalanceAmount} from '@yoroi/types/lib/balance/token'
import BigNumber from 'bignumber.js'
import _ from 'lodash'
import React, {useEffect, useState} from 'react'
import {useIntl} from 'react-intl'
import {Alert, Platform, SectionList, SectionListProps, StyleSheet, View} from 'react-native'

import {Spacer, Text} from '../../components'
import {features} from '../../features'
import {actionMessages} from '../../i18n/global-messages'
import {formatDateRelative} from '../../legacy/format'
import {useMetrics} from '../../metrics/metricsManager'
import {useSelectedWallet} from '../../SelectedWallet'
import {
  useBalances,
  useChangeTimeAppearRampOnOffSmallBanner,
  useTimeAppearRampOnOffSmallBanner,
  useTransactionInfos,
} from '../../yoroi-wallets/hooks'
import {TransactionInfo} from '../../yoroi-wallets/types'
import {Amounts, Quantities} from '../../yoroi-wallets/utils'
import {ActionsBanner} from './ActionsBanner'
import BigBanner from './RampOnOffBanner/BigBanner'
import SmallBanner from './RampOnOffBanner/SmallBanner'
import {bannerRampOnOffMessages} from './RampOnOffBanner/strings'
import {TxHistoryListItem} from './TxHistoryListItem'

type ListProps = SectionListProps<TransactionInfo>

type Props = Partial<ListProps> & {
  onScroll: ListProps['onScroll']
}
export const TxHistoryList = (props: Props) => {
  const strings = useStrings()
  const key = useRemountOnFocusHack()
  const wallet = useSelectedWallet()
  const balances = useBalances(wallet)
  const {track} = useMetrics()

  useFocusEffect(
    React.useCallback(() => {
      track.transactionsPageViewed()
    }, [track]),
  )

  const primaryAmount = Amounts.getAmount(balances, wallet.primaryTokenInfo.id)
  const transactionsInfo = useTransactionInfos(wallet)
  const groupedTransactions = getTransactionsByDate(transactionsInfo)

  const handleExport = () => Alert.alert(strings.soon, strings.soon)
  const handleSearch = () => Alert.alert(strings.soon, strings.soon)

  return (
    <View style={styles.container}>
      {(features.txHistory.export || features.txHistory.search) && (
        <ActionsBanner onExport={handleExport} onSearch={handleSearch} />
      )}

      <Spacer height={18} />

      <SectionList
        {...props}
        key={key}
        ListHeaderComponent={<HeaderTransactionList primaryAmount={primaryAmount} />}
        style={{}}
        contentContainerStyle={{
          paddingHorizontal: 18,
          flexGrow: 1,
          height: 'auto',
        }}
        renderItem={({item}) => <TxHistoryListItem transaction={item} />}
        ItemSeparatorComponent={() => <Spacer height={16} />}
        renderSectionHeader={({section: {data}}) => <DayHeader ts={data[0].submittedAt} />}
        sections={groupedTransactions}
        keyExtractor={(item) => item.id}
        stickySectionHeadersEnabled={false}
        nestedScrollEnabled={true}
        maxToRenderPerBatch={20}
        initialNumToRender={20}
        testID="txHistoryList"
      />
    </View>
  )
}

const HeaderTransactionList = (props: {primaryAmount: BalanceAmount}) => {
  const {primaryAmount} = props
  const [showSmallBanner, setShowSmallBanner] = useState(false)
  const timeAppearSmallBanner = useTimeAppearRampOnOffSmallBanner()
  const {changeTimeAppear} = useChangeTimeAppearRampOnOffSmallBanner()

  const isNeedBuyAda = new BigNumber(5000000).isGreaterThan(new BigNumber(primaryAmount.quantity))
  const isAdaZero = Quantities.isZero(primaryAmount.quantity)

  const isShowBigBanner = isAdaZero
  const isShowSmallBanner = showSmallBanner && isNeedBuyAda

  const onCloseSmallBanner = () => {
    setShowSmallBanner(false)
    const today = new Date().getTime()
    const thirtyDaysInMills = 30 * 24 * 60 * 60 * 1000
    changeTimeAppear(today + thirtyDaysInMills)
  }

  useEffect(() => {
    if (!Number.isNaN(timeAppearSmallBanner)) {
      const now = new Date().getTime()
      setShowSmallBanner(now > Number(timeAppearSmallBanner))
    } else {
      setShowSmallBanner(true)
    }
  }, [timeAppearSmallBanner])

  if (isShowBigBanner) return <BigBanner />
  if (isShowSmallBanner) return <SmallBanner onClose={onCloseSmallBanner} />

  return null
}

// workaround for https://emurgo.atlassian.net/browse/YOMO-199
// related to https://github.com/facebook/react-native/issues/15694
export const useRemountOnFocusHack = () => {
  const [key, setKey] = React.useState(0)
  const navigation = useNavigation()

  React.useEffect(() => {
    if (Platform.OS !== 'ios') {
      return
    }

    const unsubscribe = navigation.addListener('focus', () => {
      setKey((key) => key + 1)
    })

    return unsubscribe
  }, [key, navigation])

  return key
}

type DayHeaderProps = {
  ts: unknown
}

const DayHeader = ({ts}: DayHeaderProps) => {
  const intl = useIntl()

  return (
    <View style={styles.dayHeaderRoot}>
      <Text testID="dayHeaderText">{isString(ts) ? formatDateRelative(ts, intl) : ''}</Text>
    </View>
  )
}

const getTransactionsByDate = (transactions: Record<string, TransactionInfo>) =>
  _(transactions)
    .filter((t) => t.submittedAt != null)
    .sortBy((t) => t.submittedAt)
    .reverse()
    .groupBy((t) => t.submittedAt?.substring(0, '2001-01-01'.length))
    .values()
    .map((data) => ({data}))
    .value()

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  dayHeaderRoot: {
    paddingTop: 16,
    paddingBottom: 8,
    paddingHorizontal: 20,
  },
})

export const useStrings = () => {
  const intl = useIntl()

  return {
    soon: intl.formatMessage(actionMessages.soon),
    buyADA: intl.formatMessage(bannerRampOnOffMessages.buyADA),
    getFirstAda: intl.formatMessage(bannerRampOnOffMessages.getFirstAda),
    ourTrustedPartners: intl.formatMessage(bannerRampOnOffMessages.ourTrustedPartners),
    needMoreAda: intl.formatMessage(bannerRampOnOffMessages.needMoreAda),
  }
}
