/* eslint-disable react-native/no-raw-text */
import {useTheme} from '@yoroi/theme'
import React, {ReactNode} from 'react'
import {StyleSheet, Text, View} from 'react-native'
import SkeletonPlaceholder from 'react-native-skeleton-placeholder'

import {Icon, Spacer} from '../../../../../components'
import {useGetPortfolioTokenInfo} from '../../../common/useGetPortfolioTokenInfo'
import {usePortfolioTokenDetailParams} from '../../../common/useNavigationTo'

export const Performance = () => {
  const {styles, colors} = useStyles()
  const {name: tokenName} = usePortfolioTokenDetailParams()
  const {data, isFetching} = useGetPortfolioTokenInfo(tokenName)

  const value = data?.info?.performance

  return (
    <View style={styles.root}>
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

        <TextGroup loading={isFetching} value={`${value?.user?.bought ?? '-/-'} USD`} label="Bought" />

        <TextGroup loading={isFetching} value={`${value?.user?.receive ?? '-/-'} USD`} label="Received" />

        <TextGroup loading={isFetching} value={`${value?.user?.sent ?? '-/-'} USD`} label="Sent" />

        <TextGroup loading={isFetching} value={`${value?.user?.sold ?? '-/-'} USD`} label="Sold" />
      </View>

      <Spacer height={24} />

      <Text style={styles.title}>Market data</Text>

      <Spacer height={16} />

      <View style={styles.container}>
        <TextGroup loading={isFetching} value={`${value?.market?.change ?? '-/-'} %`} label="Token price change" />

        <TextGroup loading={isFetching} value={`${value?.market?.price ?? '-/-'} USD`} label="Token price" />

        <TextGroup loading={isFetching} value={`${value?.market?.cap ?? '-/-'} USD`} label="Market cap" />

        <TextGroup loading={isFetching} value={`${value?.market?.vol ?? '-/-'} USD`} label="24h volume" />

        <TextGroup loading={isFetching} value={`#${value?.market?.rank ?? '-/-'}`} label="Rank" />

        <Spacer height={16} />

        <TextGroup
          loading={isFetching}
          value={`${value?.market?.circulating ?? '-/-'} ${data?.name}`}
          label="Circulating"
        />

        <TextGroup
          loading={isFetching}
          value={`${value?.market?.total_supply ?? '-/-'} ${data?.name}`}
          label="Total supply"
        />

        <TextGroup
          loading={isFetching}
          value={`${value?.market?.max_supply ?? '-/-'} ${data?.name}`}
          label="Max supply"
        />

        <TextGroup loading={isFetching} value={`${value?.market?.ath ?? '-/-'} USD`} label="All time high" />

        <TextGroup loading={isFetching} value={`${value?.market?.atl ?? '-/-'} USD`} label="All time low" />
      </View>
    </View>
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
