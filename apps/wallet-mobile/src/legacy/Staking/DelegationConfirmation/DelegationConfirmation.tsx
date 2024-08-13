import {useTheme} from '@yoroi/theme'
import {Balance} from '@yoroi/types'
import React, {useEffect, useState} from 'react'
import {defineMessages, useIntl} from 'react-intl'
import {Platform, ScrollView, StyleSheet, View} from 'react-native'
import {useQueryClient} from 'react-query'

import {KeyboardSpacer, Text, ValidatedTextInput} from '../../../components'
import {ConfirmTx} from '../../../components/ConfirmTx'
import {Space} from '../../../components/Space/Space'
import {useSelectedWallet} from '../../../features/WalletManager/common/hooks/useSelectedWallet'
import {debugWalletInfo, features} from '../../../kernel/features'
import globalMessages, {txLabels} from '../../../kernel/i18n/global-messages'
import {StakingCenterRoutes, useParams, useWalletNavigation} from '../../../kernel/navigation'
import {NETWORKS} from '../../../yoroi-wallets/cardano/networks'
import {NUMBERS} from '../../../yoroi-wallets/cardano/numbers'
import {Amounts, Entries, Quantities} from '../../../yoroi-wallets/utils'
import {formatTokenAmount, formatTokenWithText} from '../../../yoroi-wallets/utils/format'
import {useStakePoolInfoAndHistory} from '../../Dashboard/StakePoolInfo'
import {Instructions as HWInstructions} from '../../HW'

type Params = StakingCenterRoutes['delegation-confirmation']

const isParams = (params?: Params | object | undefined): params is Params => {
  return (
    !!params &&
    'yoroiUnsignedTx' in params &&
    typeof params.yoroiUnsignedTx === 'object' &&
    'poolId' in params &&
    typeof params.poolId === 'string'
  )
}

export const DelegationConfirmation = () => {
  const {resetToTxHistory} = useWalletNavigation()
  const {wallet, meta} = useSelectedWallet()
  const strings = useStrings()
  const styles = useStyles()
  const queryClient = useQueryClient()

  const {poolId, yoroiUnsignedTx} = useParams<Params>(isParams)

  if (!yoroiUnsignedTx.staking?.delegations) throw new Error('invalid transaction')
  const stakingAmount = Amounts.getAmount(Entries.toAmounts(yoroiUnsignedTx.staking.delegations), '')
  const reward = approximateReward(stakingAmount.quantity)

  const [password, setPassword] = useState('')
  const [useUSB, setUseUSB] = useState(false)

  useEffect(() => {
    if (features.prefillWalletInfo && __DEV__) setPassword(debugWalletInfo.PASSWORD)
  }, [])

  const onSuccess = () => {
    queryClient.resetQueries([wallet.id, 'stakingInfo'])
    resetToTxHistory()
  }

  return (
    <View style={styles.container}>
      <ScrollView>
        <View style={styles.itemBlock}>
          <Text style={styles.heading}>{strings.stakePoolName}</Text>

          <StakePoolName stakePoolId={poolId} />
        </View>

        <View style={styles.itemBlock}>
          <Text style={styles.heading}>{strings.stakePoolHash}</Text>

          <Text testID="stakePoolHashText" style={styles.text}>
            {poolId}
          </Text>
        </View>

        <View testID="stakingAmount">
          <Text small style={styles.fees}>
            {`+ ${formatTokenAmount(yoroiUnsignedTx.fee[wallet.primaryToken.identifier], wallet.primaryToken)} ${
              strings.ofFees
            }`}
          </Text>

          {/* requires a handler so we pass on a dummy function */}

          <ValidatedTextInput
            onChangeText={() => undefined}
            editable={false}
            value={formatTokenAmount(stakingAmount.quantity, wallet.primaryToken)}
            label={strings.amount}
          />
        </View>

        {!meta.isEasyConfirmationEnabled && !meta.isHW && (
          <View testID="spendingPassword">
            <ValidatedTextInput secureTextEntry value={password} label={strings.password} onChangeText={setPassword} />
          </View>
        )}

        <View style={styles.itemBlock}>
          <Text style={styles.text}>{strings.rewardsExplanation}</Text>

          <Text style={styles.rewards}>{formatTokenWithText(reward, wallet.primaryToken)}</Text>
        </View>

        {meta.isHW && <HWInstructions useUSB={useUSB} addMargin />}
      </ScrollView>

      <Space height="lg" />

      <ConfirmTx
        buttonProps={{
          shelleyTheme: true,
          title: strings.delegateButtonLabel,
        }}
        isProvidingPassword
        providedPassword={password}
        onSuccess={onSuccess}
        setUseUSB={setUseUSB}
        useUSB={useUSB}
        yoroiUnsignedTx={yoroiUnsignedTx}
        chooseTransportOnConfirmation
      />

      {/* hack to fix weird KeyboardAvoidingView bug in THIS SCREEN */}
      {Platform.OS === 'ios' && <KeyboardSpacer />}
    </View>
  )
}

const StakePoolName = ({stakePoolId}: {stakePoolId: string}) => {
  const strings = useStrings()
  const styles = useStyles()
  const {wallet} = useSelectedWallet()
  const {stakePoolInfoAndHistory, isLoading, error} = useStakePoolInfoAndHistory({wallet, stakePoolId})

  return (
    <Text style={styles.text}>
      {isLoading ? '...' : error ? strings.unknownPool : stakePoolInfoAndHistory?.info.name}
    </Text>
  )
}

const useStyles = () => {
  const {atoms, color} = useTheme()
  const styles = StyleSheet.create({
    container: {
      backgroundColor: color.bg_color_high,
      ...atoms.px_lg,
      ...atoms.pb_2xl,
      flex: 1,
    },
    itemBlock: {
      ...atoms.pt_2xl,
    },
    heading: {
      color: color.gray_c900,
      ...atoms.body_1_lg_medium,
    },
    text: {
      color: color.gray_c900,
      ...atoms.body_2_md_regular,
    },
    rewards: {
      ...atoms.body_1_lg_medium,
      color: color.primary_c600,
    },
    fees: {
      textAlign: 'right',
      color: color.gray_c900,
    },
  })
  return styles
}

const useStrings = () => {
  const intl = useIntl()

  return {
    stakePoolName: intl.formatMessage(globalMessages.stakePoolName),
    stakePoolHash: intl.formatMessage(globalMessages.stakePoolHash),
    ofFees: intl.formatMessage(messages.ofFees),
    amount: intl.formatMessage(txLabels.amount),
    password: intl.formatMessage(txLabels.password),
    rewardsExplanation: intl.formatMessage(messages.rewardsExplanation),
    delegateButtonLabel: intl.formatMessage(messages.delegateButtonLabel),
    unknownPool: intl.formatMessage(messages.unknownPool),
  }
}

const messages = defineMessages({
  delegateButtonLabel: {
    id: 'components.stakingcenter.confirmDelegation.delegateButtonLabel',
    defaultMessage: '!!!Delegate',
  },
  ofFees: {
    id: 'components.stakingcenter.confirmDelegation.ofFees',
    defaultMessage: '!!!of fees',
  },
  rewardsExplanation: {
    id: 'components.stakingcenter.confirmDelegation.rewardsExplanation',
    defaultMessage: '!!!Current approximation of rewards that you will receive per epoch:',
  },
  unknownPool: {
    id: 'components.delegationsummary.delegatedStakepoolInfo.unknownPool',
    defaultMessage: '!!!Unknown pool',
  },
})

/**
 * returns approximate rewards per epoch in lovelaces
 * TODO: based on https://staking.cardano.org/en/calculator/
 *  needs to be update per-network
 */
const approximateReward = (stakedQuantity: Balance.Quantity): Balance.Quantity => {
  return Quantities.quotient(
    Quantities.product([stakedQuantity, `${NETWORKS.HASKELL_SHELLEY.PER_EPOCH_PERCENTAGE_REWARD}`]),
    NUMBERS.EPOCH_REWARD_DENOMINATOR.toString() as Balance.Quantity,
  )
}
