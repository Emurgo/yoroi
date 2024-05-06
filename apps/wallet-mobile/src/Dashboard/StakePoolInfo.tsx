import {useTheme} from '@yoroi/theme'
import React from 'react'
import {defineMessages, useIntl} from 'react-intl'
import {ActivityIndicator, Linking, StyleSheet, View} from 'react-native'
import {useQuery, UseQueryOptions} from 'react-query'

import {Button, CopyButton, Text, TitledCard} from '../components'
import {useSelectedWallet} from '../features/WalletManager/Context'
import {isEmptyString} from '../utils/utils'
import {YoroiWallet} from '../yoroi-wallets/cardano/types'
import {StakePoolInfoAndHistory} from '../yoroi-wallets/types'

export const StakePoolInfo = ({stakePoolId}: {stakePoolId: string}) => {
  const strings = useStrings()
  const styles = useStyles()
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

const useStyles = () => {
  const {color, atoms} = useTheme()
  const styles = StyleSheet.create({
    topBlock: {
      ...atoms.py_sm,
      ...atoms.py_lg,
    },
    poolName: {
      ...atoms.body_1_lg_regular,
    },
    poolIdBlock: {
      flexDirection: 'row',
    },
    poolId: {
      color: color.gray_c700,
      ...atoms.body_2_md_regular,
      flex: 1,
    },
    bottomBlock: {
      ...atoms.px_lg,
      ...atoms.py_xl,
    },
    warning: {
      ...atoms.p_sm,
    },
    warningText: {
      fontStyle: 'italic',
      ...atoms.body_3_sm_regular,
    },
  })
  return styles
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
