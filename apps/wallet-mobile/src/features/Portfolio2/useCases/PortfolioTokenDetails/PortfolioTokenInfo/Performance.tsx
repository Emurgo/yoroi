/* eslint-disable react-native/no-raw-text */
import {infoExtractName} from '@yoroi/portfolio'
import {useTheme} from '@yoroi/theme'
import React, {ReactNode} from 'react'
import {NativeScrollEvent, NativeSyntheticEvent, StyleSheet, Text, View} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'
import SkeletonPlaceholder from 'react-native-skeleton-placeholder'

import {Icon, Spacer} from '../../../../../components'
import {ScrollView} from '../../../../../components/ScrollView/ScrollView'
import {useSelectedWallet} from '../../../../../features/WalletManager/context/SelectedWalletContext'
import {useGetPortfolioTokenInfo} from '../../../common/useGetPortfolioTokenInfo'
import {usePortfolioTokenDetailParams} from '../../../common/useNavigateTo'
import {useStrings} from '../../../common/useStrings'

interface Props {
  onScroll: (event: NativeSyntheticEvent<NativeScrollEvent>) => void
  topContent?: ReactNode
}

export const Performance = ({onScroll, topContent}: Props) => {
  const {styles, colors} = useStyles()
  const {id: tokenId} = usePortfolioTokenDetailParams()
  const wallet = useSelectedWallet()
  const {balances} = wallet
  const tokenInfo = balances.records.get(tokenId)
  const tokenSymbol = tokenInfo ? infoExtractName(tokenInfo.info, {mode: 'currency'}) : '-'
  const {data, isFetching} = useGetPortfolioTokenInfo(tokenSymbol)
  const strings = useStrings()

  const value = data?.info?.performance

  return (
    <SafeAreaView style={styles.root} edges={['left', 'right', 'bottom']}>
      <ScrollView scrollEventThrottle={16} onScroll={onScroll} style={styles.scrollView}>
        {topContent}

        <Spacer height={16} />

        <View style={styles.container}>
          <TextGroup loading={isFetching} value={`${value?.user?.pnl ?? '-/-'} %`}>
            <View style={styles.labelGroup}>
              <Text style={styles.label}>PnL</Text>

              <Icon.InfoCircle size={20} color={colors.label} />
            </View>
          </TextGroup>

          <Spacer height={2} />

          <TextGroup loading={isFetching} value={`${value?.user?.invested ?? '-/-'} USD`}>
            <View style={styles.labelGroup}>
              <Text style={styles.label}>Net invested</Text>

              <Icon.InfoCircle size={20} color={colors.label} />
            </View>
          </TextGroup>

          <Spacer height={16} />

          <TextGroup loading={isFetching} value={`${value?.user?.bought ?? '-/-'} USD`} label={strings.bought} />

          <TextGroup loading={isFetching} value={`${value?.user?.receive ?? '-/-'} USD`} label={strings.received} />

          <TextGroup loading={isFetching} value={`${value?.user?.sent ?? '-/-'} USD`} label={strings.sent} />

          <TextGroup loading={isFetching} value={`${value?.user?.sold ?? '-/-'} USD`} label={strings.sold} />
        </View>

        <Spacer height={24} />

        <Text style={styles.title}>{strings.marketData}</Text>

        <Spacer height={16} />

        <View style={styles.container}>
          <TextGroup
            loading={isFetching}
            value={`${value?.market?.change ?? '-/-'} %`}
            label={strings.tokenPriceChange}
          />

          <TextGroup loading={isFetching} value={`${value?.market?.price ?? '-/-'} USD`} label={strings.tokenPrice} />

          <TextGroup loading={isFetching} value={`${value?.market?.cap ?? '-/-'} USD`} label={strings.marketCap} />

          <TextGroup loading={isFetching} value={`${value?.market?.vol ?? '-/-'} USD`} label={strings._24hVolume} />

          <TextGroup loading={isFetching} value={`#${value?.market?.rank ?? '-/-'}`} label={strings.rank} />

          <Spacer height={16} />

          <TextGroup
            loading={isFetching}
            value={`${value?.market?.circulating ?? '-/-'} ${tokenSymbol}`}
            label={strings.circulating}
          />

          <TextGroup
            loading={isFetching}
            value={`${value?.market?.total_supply ?? '-/-'} ${tokenSymbol}`}
            label={strings.totalSupply}
          />

          <TextGroup
            loading={isFetching}
            value={`${value?.market?.max_supply ?? '-/-'} ${tokenSymbol}`}
            label={strings.maxSupply}
          />

          <TextGroup loading={isFetching} value={`${value?.market?.ath ?? '-/-'} USD`} label={strings.allTimeHigh} />

          <TextGroup loading={isFetching} value={`${value?.market?.atl ?? '-/-'} USD`} label={strings.allTimeLow} />
        </View>

        {/* Fix the bounce when scroll down */}
        <Spacer height={150} />
      </ScrollView>
    </SafeAreaView>
  )
}

interface TextGroupProps {
  label?: string
  value?: string
  children?: ReactNode
  loading?: boolean
}
const TextGroup = ({label, loading, value, children}: TextGroupProps) => {
  const {styles, colors} = useStyles()

  return (
    <View style={styles.group}>
      {children !== undefined ? (
        children
      ) : (
        <View>
          <Text style={styles.label}>{label}</Text>
        </View>
      )}

      {loading ? (
        <SkeletonPlaceholder borderRadius={20} backgroundColor={colors.skeleton}>
          <SkeletonPlaceholder.Item width={64} height={16} />
        </SkeletonPlaceholder>
      ) : (
        <View>
          <Text style={styles.textValue}>{value}</Text>
        </View>
      )}
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
      ...atoms.px_lg,
      ...atoms.flex_1,
    },
    container: {
      ...atoms.flex_1,
      ...atoms.flex_col,
      ...atoms.gap_sm,
    },
    group: {
      ...atoms.flex_1,
      ...atoms.flex_row,
      ...atoms.justify_between,
      ...atoms.align_center,
    },
    labelGroup: {
      ...atoms.flex_1,
      ...atoms.flex_row,
      ...atoms.align_center,
      gap: 3,
    },
    label: {
      ...atoms.body_1_lg_regular,
      color: color.gray_c600,
    },
    textValue: {
      ...atoms.body_1_lg_regular,
      color: color.gray_cmax,
    },
    title: {
      ...atoms.body_1_lg_medium,
      ...atoms.font_semibold,
      color: color.gray_c800,
    },
  })

  const colors = {
    label: color.gray_c600,
    skeleton: color.gray_c100,
  }

  return {styles, colors} as const
}
