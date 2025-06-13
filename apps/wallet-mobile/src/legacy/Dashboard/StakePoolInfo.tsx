import {PoolInfoApi} from '@emurgo/yoroi-lib'
import {useTheme} from '@yoroi/theme'
import React from 'react'
import {defineMessages, useIntl} from 'react-intl'
import {ActivityIndicator, Linking, StyleSheet, View} from 'react-native'
import {useQuery, UseQueryOptions} from 'react-query'

import {Button, ButtonProps, ButtonType} from '../../components/Button/Button'
import {CopyButton} from '../../components/CopyButton'
import {Text} from '../../components/Text'
import {TitledCard} from '../../components/TitledCard'
import {useSelectedNetwork} from '../../features/WalletManager/common/hooks/useSelectedNetwork'
import {useSelectedWallet} from '../../features/WalletManager/common/hooks/useSelectedWallet'
import {isEmptyString} from '../../kernel/utils'
import {YoroiWallet} from '../../yoroi-wallets/cardano/types'
import {StakePoolInfoAndHistory} from '../../yoroi-wallets/types/staking'

type StakePoolInfoProps = {
  stakePoolId: string
  ctaProps?: ButtonProps
}
export const StakePoolInfo = ({stakePoolId, ctaProps}: StakePoolInfoProps) => {
  const strings = useStrings()
  const {styles, bold} = useStyles()
  const {isDark} = useTheme()
  const {wallet} = useSelectedWallet()

  const {stakePoolInfoAndHistory, isLoading} = useStakePoolInfoAndHistory({wallet, stakePoolId})
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
            fontOverride={bold}
          />

          <CopyButton title={stakePoolId} value={stakePoolId} message={strings.copied} />

          {ctaProps && <Button type={ButtonType.Secondary} size="S" title={strings.undelegate} {...ctaProps} />}
        </View>
      </TitledCard>

      <View style={styles.warning}>
        <Text secondary style={styles.warningText}>
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
      const stakePoolInfosAndHistories = await wallet.fetchPoolInfo({poolIds: [stakePoolId]})

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

const useStyles = () => {
  const {color, atoms} = useTheme()
  const styles = StyleSheet.create({
    container: {
      ...atoms.gap_md,
    },
    poolName: {
      ...atoms.self_start,
    },
    warning: {
      ...atoms.p_sm,
    },
    warningText: {
      color: color.gray_500,
      ...atoms.italic,
      ...atoms.body_3_sm_regular,
    },
  })
  return {styles, bold: atoms.body_1_lg_medium}
}

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
