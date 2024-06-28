import {init} from '@emurgo/cross-csl-mobile'
import {PoolInfoApi} from '@emurgo/yoroi-lib'
import {useNavigation} from '@react-navigation/native'
import {Wallet} from '@yoroi/types'
import BigNumber from 'bignumber.js'
import * as React from 'react'
import {defineMessages, useIntl} from 'react-intl'
import {useQuery} from 'react-query'

import {features} from '../../../features'
import {useSelectedNetwork} from '../../../features/WalletManager/common/hooks/useSelectedNetwork'
import {useSelectedWallet} from '../../../features/WalletManager/common/hooks/useSelectedWallet'
import {YoroiWallet} from '../../../yoroi-wallets/cardano/types'
import {asQuantity, Quantities} from '../../../yoroi-wallets/utils'
import {useStakingInfo} from '../../Dashboard/StakePoolInfos'

const createDelegationTx = async (wallet: YoroiWallet, poolId: string, meta: Wallet.Meta) => {
  const accountStates = await wallet.fetchAccountState()
  const accountState = accountStates[wallet.rewardAddressHex]
  if (!accountState) throw new Error('Account state not found')

  const stakingUtxos = await wallet.getAllUtxosForKey()
  const amountToDelegate = Quantities.sum([
    ...stakingUtxos.map((utxo) => asQuantity(utxo.amount)),
    asQuantity(accountState.remainingAmount),
  ])

  return wallet.createDelegationTx({
    poolId,
    delegatedAmount: new BigNumber(amountToDelegate),
    addressMode: meta.addressMode,
  })
}

export const usePoolTransition = () => {
  const navigation = useNavigation()
  const {wallet, meta} = useSelectedWallet()
  const {networkManager} = useSelectedNetwork()
  const {stakingInfo, isLoading} = useStakingInfo(wallet)
  const poolInfoApi = React.useMemo(
    () => new PoolInfoApi(networkManager.legacyApiBaseUrl),
    [networkManager.legacyApiBaseUrl],
  )

  const isStaked = stakingInfo?.status === 'staked'
  const currentPoolId = isStaked ? stakingInfo?.poolId : ''

  const poolTransitionQuery = useQuery({
    enabled: isStaked,
    retry: false,
    staleTime: Infinity,
    queryKey: [wallet.id, 'poolTransition', currentPoolId],
    queryFn: () => (features.poolTransition ? poolInfoApi.getTransition(currentPoolId, init) : null),
  })

  const poolTransition = poolTransitionQuery.data ?? null
  const poolId = poolTransition?.suggested.hash ?? ''

  const navigateToUpdate = React.useCallback(async () => {
    try {
      const yoroiUnsignedTx = await createDelegationTx(wallet, poolId, meta)
      navigation.navigate('manage-wallets', {
        screen: 'staking-dashboard',
        params: {
          screen: 'delegation-confirmation',
          initial: false,
          params: {
            poolId,
            yoroiUnsignedTx,
          },
        },
      })
    } catch (err) {
      navigation.navigate('manage-wallets', {
        screen: 'staking-dashboard',
        params: {
          screen: 'delegation-failed-tx',
          initial: false,
        },
      })
    }
  }, [meta, navigation, poolId, wallet])

  return {
    ...poolTransitionQuery,
    isLoading: isLoading || poolTransitionQuery.isInitialLoading,
    poolTransition,
    isPoolRetiring: poolTransition !== null,
    navigateToUpdate,
  }
}

export const useStrings = () => {
  const intl = useIntl()

  return {
    title: intl.formatMessage(messages.title),
    warning: intl.formatMessage(messages.warning),
    finalWarning: intl.formatMessage(messages.finalWarning),
    currentPool: intl.formatMessage(messages.currentPool),
    newPool: intl.formatMessage(messages.newPool),
    estimatedRoa: intl.formatMessage(messages.estimatedRoa),
    fee: intl.formatMessage(messages.fee),
    poolGeneratesRewards: intl.formatMessage(messages.poolGeneratesRewards),
    poolNoRewards: intl.formatMessage(messages.poolNoRewards),
    poolWillStopRewards: intl.formatMessage(messages.poolWillStopRewards),
    skipNoRewards: intl.formatMessage(messages.skipNoRewards),
    updateKeepEarning: intl.formatMessage(messages.updateKeepEarning),
    update: intl.formatMessage(messages.update),
  }
}

const messages = defineMessages({
  title: {
    id: 'components.pooltransition.title',
    defaultMessage: '!!!Upgrade your stake pool',
  },
  warning: {
    id: 'components.pooltransition.warning',
    defaultMessage:
      "!!!The current stake pool you're using will soon close. Migrate to the new EMURGO pool to sustain reward generation.",
  },
  finalWarning: {
    id: 'components.pooltransition.finalWarning',
    defaultMessage:
      "!!!The current stake pool you're using is decommissioned and NOT generating reward anymore. Update it to continue earning",
  },
  currentPool: {
    id: 'components.pooltransition.currentPool',
    defaultMessage: '!!!Current pool',
  },
  newPool: {
    id: 'components.pooltransition.newPool',
    defaultMessage: '!!!New pool',
  },
  estimatedRoa: {
    id: 'components.pooltransition.estimatedRoa',
    defaultMessage: '!!!Estimated ROA',
  },
  fee: {
    id: 'components.pooltransition.fee',
    defaultMessage: '!!!Fee',
  },
  poolGeneratesRewards: {
    id: 'components.pooltransition.poolGeneratesRewards',
    defaultMessage: '!!!This pool continues to generate staking rewards',
  },
  poolNoRewards: {
    id: 'components.pooltransition.poolNoRewards',
    defaultMessage: '!!!This pool is NOT generating staking rewards anymore',
  },
  poolWillStopRewards: {
    id: 'components.pooltransition.poolWillStopRewards',
    defaultMessage: '!!!This pool will stop generating rewards in',
  },
  skipNoRewards: {
    id: 'components.pooltransition.skipNoRewards',
    defaultMessage: '!!!Skip and stop receiving rewards',
  },
  updateKeepEarning: {
    id: 'components.pooltransition.updateKeepEarning',
    defaultMessage: '!!!Update now and keep earning',
  },
  update: {
    id: 'components.pooltransition.update',
    defaultMessage: '!!!Update pool',
  },
})
