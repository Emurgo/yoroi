import {infoExtractName} from '@yoroi/portfolio'
import {atoms as a, useTheme} from '@yoroi/theme'
import React, {ReactNode} from 'react'
import {Text, View} from 'react-native'
import SkeletonPlaceholder from 'react-native-skeleton-placeholder'

import {useGetPortfolioTokenInfo} from '~/features/Portfolio/common/hooks/useGetPortfolioTokenInfo'
import {usePortfolioTokenDetailParams} from '~/features/Portfolio/common/hooks/useNavigateTo'
import {useStrings} from '~/features/Portfolio/common/hooks/useStrings'
import {useSelectedWallet} from '~/features/WalletManager/hooks/useSelectedWallet'
import {Space} from '~/ui/Space/Space'

export const Performance = () => {
  const {atoms: ta, palette: p} = useTheme()
  const {id: tokenId} = usePortfolioTokenDetailParams()
  const {
    wallet: {balances},
  } = useSelectedWallet()
  const tokenInfo = balances.records.get(tokenId)
  const tokenSymbol = tokenInfo
    ? infoExtractName(tokenInfo.info, {mode: 'currency'})
    : '-'
  const {data, isFetching} = useGetPortfolioTokenInfo(tokenSymbol)
  const strings = useStrings()

  const value = data?.info?.performance

  return (
    <View style={[a.flex_1]}>
      <Space.Height.sm />

      <View style={[a.flex_1, a.flex_col, a.gap_sm]}>
        {/* <TextGroup loading={isFetching} value={`${value?.user?.pnl ?? '-/-'} %`}>
            <View style={styles.labelGroup}>
              <Text style={styles.label}>PnL</Text>

              <Icon.InfoCircle size={20} color={colors.label} />
            </View>
          </TextGroup>

          <Space.Height._2xs />

          <TextGroup loading={isFetching} value={`${value?.user?.invested ?? '-/-'} USD`}>
            <View style={styles.labelGroup}>
              <Text style={styles.label}>Net invested</Text>

              <Icon.InfoCircle size={20} color={colors.label} />
            </View>
          </TextGroup>

        <Space.Height.md /> */}

        <TextGroup
          loading={isFetching}
          value={`${value?.user?.bought ?? '-/-'} USD`}
          label={strings.bought}
        />

        <TextGroup
          loading={isFetching}
          value={`${value?.user?.receive ?? '-/-'} USD`}
          label={strings.received}
        />

        <TextGroup
          loading={isFetching}
          value={`${value?.user?.sent ?? '-/-'} USD`}
          label={strings.sent}
        />

        <TextGroup
          loading={isFetching}
          value={`${value?.user?.sold ?? '-/-'} USD`}
          label={strings.sold}
        />
      </View>

      <Space.Height.lg />

      <Text style={[a.body_1_lg_medium, a.font_semibold, {color: p.gray_800}]}>
        {strings.marketData}
      </Text>

      <Space.Height.md />

      <View style={[a.flex_1, a.flex_col, a.gap_sm]}>
        <TextGroup
          loading={isFetching}
          value={`${value?.market?.change ?? '-/-'} %`}
          label={strings.tokenPriceChange}
        />

        <TextGroup
          loading={isFetching}
          value={`${value?.market?.price ?? '-/-'} USD`}
          label={strings.tokenPrice}
        />

        <TextGroup
          loading={isFetching}
          value={`${value?.market?.cap ?? '-/-'} USD`}
          label={strings.marketCap}
        />

        <TextGroup
          loading={isFetching}
          value={`${value?.market?.vol ?? '-/-'} USD`}
          label={strings._24hVolume}
        />

        <TextGroup
          loading={isFetching}
          value={`#${value?.market?.rank ?? '-/-'}`}
          label={strings.rank}
        />

        <Space.Height.md />

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

        <TextGroup
          loading={isFetching}
          value={`${value?.market?.ath ?? '-/-'} USD`}
          label={strings.allTimeHigh}
        />

        <TextGroup
          loading={isFetching}
          value={`${value?.market?.atl ?? '-/-'} USD`}
          label={strings.allTimeLow}
        />
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
  const {atoms: ta, palette: p} = useTheme()

  return (
    <View style={[a.flex_1, a.flex_row, a.justify_between, a.align_center]}>
      {children !== undefined ? (
        children
      ) : (
        <View>
          <Text style={[a.body_1_lg_regular, {color: p.gray_600}]}>
            {label}
          </Text>
        </View>
      )}

      {loading ? (
        <SkeletonPlaceholder borderRadius={20} backgroundColor={p.gray_100}>
          <SkeletonPlaceholder.Item width={64} height={16} />
        </SkeletonPlaceholder>
      ) : (
        <View>
          <Text style={[a.body_1_lg_regular, {color: p.gray_max}]}>
            {value}
          </Text>
        </View>
      )}
    </View>
  )
}
