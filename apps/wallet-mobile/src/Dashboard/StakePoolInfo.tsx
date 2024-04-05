import React from 'react'
import {defineMessages, useIntl} from 'react-intl'
import {ActivityIndicator, Linking, StyleSheet, View} from 'react-native'
import {useQuery, UseQueryOptions} from 'react-query'

import {Button, CopyButton, Text, TitledCard} from '../components'
import {useSelectedWallet} from '../features/Wallet/common/Context'
import {COLORS} from '../theme'
import {isEmptyString} from '../utils/utils'
import {YoroiWallet} from '../yoroi-wallets/cardano/types'
import {StakePoolInfoAndHistory} from '../yoroi-wallets/types'

export const StakePoolInfo = ({stakePoolId}: {stakePoolId: string}) => {
  const strings = useStrings()
  const wallet = useSelectedWallet()
  const {stakePoolInfoAndHistory, isLoading} = useStakePoolInfoAndHistory({wallet, stakePoolId})
  const homepage = stakePoolInfoAndHistory?.info?.homepage

  if (isLoading) {
    return <ActivityIndicator size="large" color="black" />
  }

  return stakePoolInfoAndHistory?.info ? (
    <View>
      <TitledCard title={strings.title} variant="poolInfo" testID="stakePoolInfoTitleCard">
        <View style={styles.topBlock}>
          <Text bold style={styles.poolName}>
            {formatStakepoolNameWithTicker(stakePoolInfoAndHistory.info.ticker, stakePoolInfoAndHistory.info.name) ??
              strings.unknownPool}
          </Text>

          <View style={styles.poolIdBlock}>
            <Text
              numberOfLines={1}
              ellipsizeMode="middle"
              monospace
              style={styles.poolId}
              testID="stakePoolInfoPoolIdText"
            >
              {stakePoolId}
            </Text>

            <CopyButton value={stakePoolId} />
          </View>
        </View>

        {!isEmptyString(homepage) && (
          <View style={styles.bottomBlock}>
            <Button
              outlineOnLight
              shelleyTheme
              onPress={() => Linking.openURL(homepage)}
              title={strings.goToWebsiteButtonLabel}
            />
          </View>
        )}
      </TitledCard>

      <View style={styles.warning}>
        <Text secondary style={styles.warningText}>
          {strings.warning}
        </Text>
      </View>
    </View>
  ) : null
}

export const useStakePoolInfoAndHistory = (
  {wallet, stakePoolId}: {wallet: YoroiWallet; stakePoolId: string},
  options?: UseQueryOptions<
    StakePoolInfoAndHistory | null,
    Error,
    StakePoolInfoAndHistory | null,
    [string, string, string]
  >,
) => {
  const query = useQuery({
    ...options,
    queryKey: [wallet.id, 'stakePoolInfo', stakePoolId],
    queryFn: async () => {
      const stakePoolInfosAndHistories = await wallet.fetchPoolInfo({poolIds: [stakePoolId]})

      return stakePoolInfosAndHistories[stakePoolId]
    },
  })

  return {
    stakePoolInfoAndHistory: query.data,
    ...query,
  }
}

const styles = StyleSheet.create({
  topBlock: {
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  poolName: {
    lineHeight: 24,
    fontSize: 16,
  },
  poolIdBlock: {
    flexDirection: 'row',
  },
  poolId: {
    color: COLORS.LIGHT_GRAY_TEXT,
    lineHeight: 22,
    fontSize: 14,
    flex: 1,
  },
  bottomBlock: {
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  warning: {
    padding: 8,
  },
  warningText: {
    fontStyle: 'italic',
    fontSize: 12,
    lineHeight: 14,
  },
})

const messages = defineMessages({
  title: {
    id: 'components.delegationsummary.delegatedStakepoolInfo.title',
    defaultMessage: '!!!Stake pool delegated',
  },
  warning: {
    id: 'components.delegationsummary.delegatedStakepoolInfo.warning',
    defaultMessage:
      '!!!If you just delegated to a new stake pool it may ' +
      ' take a couple of minutes for the network to process your request.',
  },
  goToWebsiteButtonLabel: {
    id: 'components.delegationsummary.delegatedStakepoolInfo.fullDescriptionButtonLabel',
    defaultMessage: '!!!Go to website',
  },
  copied: {
    id: 'components.delegationsummary.delegatedStakepoolInfo.copied',
    defaultMessage: '!!!Copied!',
  },
  unknownPool: {
    id: 'components.delegationsummary.delegatedStakepoolInfo.unknownPool',
    defaultMessage: '!!!Unknown pool',
  },
})

const useStrings = () => {
  const intl = useIntl()

  return {
    title: intl.formatMessage(messages.title),
    warning: intl.formatMessage(messages.warning),
    goToWebsiteButtonLabel: intl.formatMessage(messages.goToWebsiteButtonLabel),
    copied: intl.formatMessage(messages.copied),
    unknownPool: intl.formatMessage(messages.unknownPool),
  }
}

const formatStakepoolNameWithTicker = (ticker?: string, name?: string) => {
  const nameWithTicker = [!isEmptyString(ticker) && !isEmptyString(name) ? `(${ticker})` : ticker, name]
    .join(' ')
    .trim()
  if (nameWithTicker.length > 0) return nameWithTicker
}
