import {PoolInfo} from '@emurgo/yoroi-lib'
import {useNavigation} from '@react-navigation/native'
import {useTheme} from '@yoroi/theme'
import BigNumber from 'bignumber.js'
import React from 'react'
import {defineMessages, useIntl} from 'react-intl'
import {Image, StyleSheet, Text, View, ViewProps} from 'react-native'
import LinearGradient from 'react-native-linear-gradient'
import {useQuery} from 'react-query'

import {Button, Icon, useModal} from '../../components'
import {Space} from '../../components/Space/Space'
import {useStakingInfo} from '../../Dashboard/StakePoolInfos'
import {useSelectedWallet} from '../../features/WalletManager/Context'
import {YoroiWallet} from '../../yoroi-wallets/cardano/types'
import {asQuantity, formatTimeSpan, Quantities} from '../../yoroi-wallets/utils'

// TODO: PoolTransition and getPoolTransition will come from yoroi-lib
type PoolTransition = {
  currentPool: PoolInfo & {tax: number}
  suggestedPool: PoolInfo & {tax: number}
  deadlineMilliseconds: number
}

const getPoolTransition = async (currentPoolId: string): Promise<PoolTransition | null> => {
  return new Promise((resolve) => {
    if (currentPoolId === 'd248ded3c18e0e80d07a46f00a2d808075b989ccb1a0e40a76e5cee1') {
      resolve({
        currentPool: {
          pic: 'https://img.cexplorer.io/a/5/5/f/2/pool12eht6dqxpzqj87xuextrpufz2gxmt4reuesuw26r2utzw0kw906.png',
          ticker: 'EMRG',
          name: 'emurgo old',
          roa: '0',
          tax: '3.5',
        } as unknown as PoolInfo & {tax: number},
        suggestedPool: {
          pic: 'https://img.cexplorer.io/e/c/2/3/1/pool1dkww2vlysa8lsnuf5rca979zdsyr3zvt59hu7e420yxfunkka2z.png',
          id: 'df1750df9b2df285fcfb50f4740657a18ee3af42727d410c37b86207',
          name: 'emurgo new',
          roa: '5.1',
          ticker: 'EMRG',
          tax: '3.2',
        } as unknown as PoolInfo & {tax: number},
        deadlineMilliseconds: 2999777000,
      })
    } else {
      resolve(null)
    }
  })
}

const createDelegationTx = async (wallet: YoroiWallet, poolId: string) => {
  const accountStates = await wallet.fetchAccountState()
  const accountState = accountStates[wallet.rewardAddressHex]
  if (!accountState) throw new Error('Account state not found')

  const stakingUtxos = await wallet.getAllUtxosForKey()
  const amountToDelegate = Quantities.sum([
    ...stakingUtxos.map((utxo) => asQuantity(utxo.amount)),
    asQuantity(accountState.remainingAmount),
  ])

  return wallet.createDelegationTx(poolId, new BigNumber(amountToDelegate))
}

export const usePoolTransition = () => {
  const navigation = useNavigation()
  const wallet = useSelectedWallet()
  const {stakingInfo} = useStakingInfo(wallet)

  const isStaked = stakingInfo?.status === 'staked'
  const currentPoolId = isStaked ? stakingInfo?.poolId : ''

  const poolTransitionQuery = useQuery({
    enabled: isStaked,
    retry: false,
    staleTime: 20 * 1000,
    queryKey: [wallet.id, 'poolTransition', currentPoolId],
    queryFn: () => getPoolTransition(currentPoolId),
  })

  const poolTransition = poolTransitionQuery.data ?? null
  const poolId = poolTransition?.suggestedPool.id ?? ''

  const navigateToUpdate = React.useCallback(async () => {
    try {
      const yoroiUnsignedTx = await createDelegationTx(wallet, poolId)
      navigation.navigate('app-root', {
        screen: 'main-wallet-routes',
        params: {
          screen: 'staking-dashboard',
          params: {
            screen: 'delegation-confirmation',
            initial: false,
            params: {
              poolId,
              yoroiUnsignedTx,
            },
          },
        },
      })
    } catch (err) {
      navigation.navigate('app-root', {
        screen: 'wallet-selection',
      })
    }
  }, [navigation, poolId, wallet])

  return {
    ...poolTransitionQuery,
    poolTransition,
    isPoolRetiring: !!poolTransition,
    navigateToUpdate,
  }
}

export const usePoolTransitionModal = () => {
  const {poolTransition, isPoolRetiring, isLoading} = usePoolTransition()
  const {openModal} = useModal()
  const strings = useStrings()
  const {modalHeight} = useStyles()

  React.useEffect(() => {
    if (isPoolRetiring) {
      openModal(strings.title, <Modal />, modalHeight)
    }
  }, [isPoolRetiring, modalHeight, openModal, poolTransition, strings.title])

  return {isLoading}
}

const Modal = () => {
  const {poolTransition, navigateToUpdate} = usePoolTransition()

  const {styles, colors} = useStyles()
  const strings = useStrings()

  const {closeModal} = useModal()

  React.useEffect(() => {
    if (!poolTransition) {
      closeModal()
    }
  }, [closeModal, poolTransition, strings.title])

  if (!poolTransition) return null

  const handleOnSkip = () => {
    closeModal()
  }

  const handleOnUpdate = () => {
    closeModal()
    navigateToUpdate()
  }

  const isActive = poolTransition.deadlineMilliseconds > 0

  return (
    <View style={styles.modal}>
      <Text style={styles.details}>{isActive ? strings.warning : strings.finalWarning}</Text>

      <Space fill height="l" />

      <View style={[styles.card, isActive ? styles.border : styles.warningBorder]}>
        <Row>
          <Text style={styles.label}>{strings.currentPool}</Text>

          <View style={styles.poolTicker}>
            {poolTransition.currentPool.pic != null && (
              <Image source={{uri: poolTransition.currentPool.pic}} style={styles.pic} />
            )}

            <Text
              style={styles.poolTickerText}
            >{`[${poolTransition.currentPool.ticker}] ${poolTransition.currentPool.name}`}</Text>
          </View>
        </Row>

        <Row>
          <Text style={styles.label}>{strings.estimatedRoa}</Text>

          <Text style={styles.currentValue}>{poolTransition.currentPool.roa} %</Text>
        </Row>

        <Row>
          <Text style={styles.label}>{strings.fee}</Text>

          <Text style={styles.currentValue}>{poolTransition.currentPool.tax} %</Text>
        </Row>

        <Text style={styles.warning}>
          <Text style={styles.warningText}>{isActive ? strings.poolWillStopRewards : strings.poolNoRewards}</Text>

          {isActive && (
            <Text style={styles.warningTimer}>
              {'\n'}

              {formatTimeSpan(poolTransition.deadlineMilliseconds)}
            </Text>
          )}
        </Text>
      </View>

      <Space height="s" />

      <Icon.ArrowDown size={17} />

      <Space height="s" />

      <View style={styles.card}>
        <LinearGradient
          style={[StyleSheet.absoluteFill, {opacity: 1, borderRadius: 8}]}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 0.5}}
          colors={colors.backgroundGradientCard}
        />

        <Row>
          <Text style={styles.label}>{strings.newPool}</Text>

          <View style={styles.poolTicker}>
            {poolTransition.suggestedPool.pic != null && (
              <Image source={{uri: poolTransition.suggestedPool.pic}} style={styles.pic} />
            )}

            <Text
              style={styles.poolTickerText}
            >{`[${poolTransition.suggestedPool.ticker}] ${poolTransition.suggestedPool.name}`}</Text>
          </View>
        </Row>

        <Row>
          <Text style={styles.label}>{strings.estimatedRoa}</Text>

          <Text style={styles.suggestedValue}>{poolTransition.suggestedPool.roa} %</Text>
        </Row>

        <Row>
          <Text style={styles.label}>{strings.fee}</Text>

          <Text style={styles.suggestedValue}>{poolTransition.suggestedPool.tax} %</Text>
        </Row>

        <Text style={styles.currentValue}>{strings.poolGeneratesRewards}</Text>
      </View>

      <Space height="xl" />

      <Actions>
        <Button outline title={strings.skipNoRewards} textStyles={styles.outlineButton} onPress={handleOnSkip} />

        <Button shelleyTheme title={strings.updateKeepEarning} onPress={handleOnUpdate} textStyles={styles.button} />
      </Actions>

      <Space height="xl" />
    </View>
  )
}

const useStyles = () => {
  const {theme} = useTheme()
  const modalHeight = 700

  const styles = StyleSheet.create({
    modal: {
      backgroundColor: theme.color['bottom-sheet-background'],
      alignItems: 'center',
      flex: 1,
      justifyContent: 'flex-end',
    },
    card: {
      borderRadius: 8,
      gap: 8,
      ...theme.padding.l,
      width: '100%',
      overflow: 'hidden',
    },
    border: {
      borderWidth: 1,
      borderColor: theme.color.gray['300'],
    },
    warningBorder: {
      borderWidth: 1,
      borderColor: theme.color.magenta['500'],
    },
    poolTicker: {
      alignItems: 'center',
      flexDirection: 'row',
      gap: 8,
    },
    poolTickerText: {
      ...theme.typography['body-1-l-regular'],
      color: theme.color.primary[600],
    },
    pic: {
      width: 24,
      height: 24,
      borderRadius: 100,
    },
    label: {
      ...theme.typography['body-1-l-regular'],
      color: theme.color.gray['600'],
    },
    currentValue: {
      ...theme.typography['body-1-l-regular'],
      color: theme.color.gray['max'],
    },
    suggestedValue: {
      ...theme.typography['body-1-l-medium'],
      color: theme.color.gray['max'],
    },
    warning: {
      color: theme.color.magenta['500'],
    },
    warningText: {
      ...theme.typography['body-1-l-regular'],
    },
    warningTimer: {
      ...theme.typography['body-1-l-medium'],
    },
    row: {
      width: '100%',
      flexDirection: 'row',
      justifyContent: 'space-between',
      height: 24,
      alignItems: 'center',
    },
    actions: {
      alignSelf: 'stretch',
      backgroundColor: theme.color.gray.min,
      gap: 4,
    },
    details: {
      ...theme.typography['body-1-l-regular'],
      color: theme.color.gray['900'],
      width: '100%',
    },
    outlineButton: {
      color: theme.color.gray[900],
      ...theme.typography['button-2-m'],
    },
    button: {
      ...theme.typography['button-1-l'],
    },
  })

  const colors = {
    backgroundGradientCard: theme.color.gradients['blue-green'],
  }

  return {styles, colors, modalHeight} as const
}

const Actions = (props: ViewProps) => {
  const {styles} = useStyles()
  return <View {...props} style={styles.actions} />
}

const Row = (props: ViewProps) => {
  const {styles} = useStyles()
  return <View {...props} style={styles.row} />
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
