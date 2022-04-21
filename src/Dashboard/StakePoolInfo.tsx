import React from 'react'
import {defineMessages, useIntl} from 'react-intl'
import {ActivityIndicator, Linking, View} from 'react-native'
import {StyleSheet} from 'react-native'
import {useQuery} from 'react-query'

import {Button, CopyButton, Text, TitledCard} from '../components'
import {useSelectedWallet} from '../SelectedWallet'
import {COLORS} from '../theme'
import {RemotePoolMetaFailure, StakePoolInfoAndHistory} from '../types'
import {YoroiWallet} from '../yoroi-wallets'

export const StakePoolInfo = ({stakePoolId}: {stakePoolId: string}) => {
  const strings = useStrings()
  const wallet = useSelectedWallet()
  const {stakePoolInfo, isLoading} = useStakePoolInfo(wallet, stakePoolId)

  if (isLoading) {
    return <ActivityIndicator size="large" color="black" />
  }

  return stakePoolInfo ? (
    <View>
      <TitledCard title={strings.title} variant="poolInfo">
        <View style={styles.topBlock}>
          <Text bold style={styles.poolName}>
            {formatStakepoolNameWithTicker(stakePoolInfo.ticker, stakePoolInfo.name) || strings.unknownPool}
          </Text>

          <View style={styles.poolIdBlock}>
            <Text numberOfLines={1} ellipsizeMode="middle" monospace style={styles.poolId}>
              {stakePoolInfo.id}
            </Text>

            <CopyButton value={stakePoolInfo.id} />
          </View>
        </View>

        {stakePoolInfo.homepage && (
          <View style={styles.bottomBlock}>
            <Button
              outlineOnLight
              shelleyTheme
              onPress={() => stakePoolInfo.homepage && Linking.openURL(stakePoolInfo.homepage)}
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

const useStakePoolInfo = (wallet: YoroiWallet, stakePoolId: string) => {
  const query = useQuery({
    queryKey: [wallet.id, 'stakePoolInfo', stakePoolId],
    queryFn: async () => {
      const stakePoolInfos = await wallet.fetchPoolInfo({poolIds: [stakePoolId]})
      const stakePoolInfo = stakePoolInfos[stakePoolId]
      if (isRemotePoolMetaFailure(stakePoolInfo)) throw stakePoolInfo.error

      return {...stakePoolInfo.info, id: stakePoolId}
    },
  })

  return {stakePoolInfo: query.data, ...query}
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
  return ticker && name //
    ? `(${ticker})  ${name}`
    : ticker && !name
    ? ticker
    : !ticker && name
    ? name
    : undefined
}

const isRemotePoolMetaFailure = (
  poolResponse: StakePoolInfoAndHistory | RemotePoolMetaFailure,
): poolResponse is RemotePoolMetaFailure => 'error' in poolResponse
