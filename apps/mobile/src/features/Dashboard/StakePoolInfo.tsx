import {PoolInfoApi} from '@emurgo/yoroi-lib'
import {useQuery, UseQueryOptions} from '@tanstack/react-query'
import {atoms as a, useTheme} from '@yoroi/theme'
import React from 'react'
import {defineMessages, useIntl} from 'react-intl'
import {ActivityIndicator, Linking, StyleSheet, View} from 'react-native'

import {Button, ButtonProps, ButtonType} from '../../ui/Button/Button'
import {Copiable} from '../../ui/Copiable'
import {Text} from '../../ui/Text/Text'
import {TitledCard} from '../../ui/TitledCard/TitledCard'
import {useSelectedNetwork} from '../../features/WalletManager/common/hooks/useSelectedNetwork'
import {useSelectedWallet} from '../../features/WalletManager/common/hooks/useSelectedWallet'
import {isEmptyString} from '../../kernel/utils'
import {YoroiWallet} from '../../wallets/cardano/types'
import {StakePoolInfoAndHistory} from '../../wallets/types/staking'

type StakePoolInfoProps = {
  stakePoolId: string
  ctaProps?: ButtonProps
}
export const StakePoolInfo = ({stakePoolId, ctaProps}: StakePoolInfoProps) => {
  const strings = useStrings()
  const {isDark, color} = useTheme()
  const {wallet} = useSelectedWallet()

  const {stakePoolInfoAndHistory, isLoading} = useStakePoolInfoAndHistory({
    wallet,
    stakePoolId,
  })
  const homepage = stakePoolInfoAndHistory?.info?.homepage

  if (isLoading) return <ActivityIndicator size="large" color={isDark ? 'white' : 'black'} />
  if (!stakePoolInfoAndHistory?.info) return null

  return (
    <View>
      <TitledCard title={strings.title} variant="poolInfo" testID="stakePoolInfoTitleCard">
        <View style={styles.container}>
          <Button
            type={ButtonType.Link}
            title={
              formatStakepoolNameWithTicker(stakePoolInfoAndHistory.info.ticker, stakePoolInfoAndHistory.info.name) ??
              strings.unknownPool
            }
            onPress={() => !isEmptyString(homepage) && Linking.openURL(homepage)}
            style={styles.poolName}
            fontOverride={a.body_1_lg_medium}
          />

          <Copiable title={stakePoolId} text={stakePoolId} feedback={strings.copied} />

          {ctaProps && <Button type={ButtonType.Secondary} size="S" title={strings.undelegate} {...ctaProps} />}
        </View>
      </TitledCard>

      <View style={styles.warning}>
        <Text secondary style={[styles.warningText, {color: color.gray_500}]}>
          {strings.warning}
        </Text>
      </View>
    </View>
  )
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
  const {networkManager} = useSelectedNetwork()
  const poolInfoApi = React.useMemo(
    () => new PoolInfoApi(networkManager.legacyApiBaseUrl),
    [networkManager.legacyApiBaseUrl],
  )
  const query = useQuery({
    ...options,
    queryKey: [wallet.id, 'stakePoolInfo', stakePoolId],
    queryFn: async () => {
      const stakePoolInfosAndHistories = await wallet.fetchPoolInfo({
        poolIds: [stakePoolId],
      })

      if (stakePoolInfosAndHistories[stakePoolId]?.info?.name != null) return stakePoolInfosAndHistories[stakePoolId]

      const history = stakePoolInfosAndHistories[stakePoolId]?.history
      if (history == null) return null

      const explorerPoolInfo = await poolInfoApi.getSingleExplorerPoolInfo(stakePoolId)

      return {
        history,
        info: {
          name: explorerPoolInfo?.name ?? '',
          ticker: explorerPoolInfo?.ticker ?? '',
        },
      }
    },
  })

  return {
    stakePoolInfoAndHistory: query.data,
    ...query,
  }
}

const styles = StyleSheet.create({
  container: {
    ...a.gap_md,
  },
  poolName: {
    ...a.self_start,
  },
  warning: {
    ...a.p_sm,
  },
  warningText: {
    ...a.italic,
    ...a.body_3_sm_regular,
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
  undelegate: {
    id: 'components.delegationsummary.delegatedStakepoolInfo.undelegate',
    defaultMessage: '!!!Undelegate',
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
    undelegate: intl.formatMessage(messages.undelegate),
  }
}

const formatStakepoolNameWithTicker = (ticker?: string, name?: string) => {
  const nameWithTicker = [!isEmptyString(ticker) && !isEmptyString(name) ? `(${ticker})` : ticker, name]
    .join(' ')
    .trim()
  if (nameWithTicker.length > 0) return nameWithTicker
}