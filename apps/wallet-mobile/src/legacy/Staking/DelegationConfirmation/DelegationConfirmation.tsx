import {useTheme} from '@yoroi/theme'
import React, {useEffect, useState} from 'react'
import {defineMessages, useIntl} from 'react-intl'
import {Platform, ScrollView, StyleSheet, View} from 'react-native'
import {useQueryClient} from 'react-query'

import {ConfirmTx} from '../../../components/ConfirmTx/ConfirmTx'
import {KeyboardSpacer} from '../../../components/KeyboardSpacer'
import {Space} from '../../../components/Space/Space'
import {Text} from '../../../components/Text'
import {ValidatedTextInput} from '../../../components/ValidatedTextInput'
import {useSelectedWallet} from '../../../features/WalletManager/common/hooks/useSelectedWallet'
import {debugWalletInfo, features} from '../../../kernel/features'
import globalMessages, {txLabels} from '../../../kernel/i18n/global-messages'
import {StakingCenterRoutes, useParams, useWalletNavigation} from '../../../kernel/navigation'
import {formatTokenAmount} from '../../../yoroi-wallets/utils/format'
import {Amounts, Entries} from '../../../yoroi-wallets/utils/utils'
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
  const stakingAmount = Amounts.getAmount(
    Entries.toAmounts(yoroiUnsignedTx.staking.delegations),
    wallet.portfolioPrimaryTokenInfo.id,
  )
  const [password, setPassword] = useState('')
  const [useUSB, setUseUSB] = useState(false)

  useEffect(() => {
    if (features.prefillWalletInfo && __DEV__) setPassword(debugWalletInfo.PASSWORD)
  }, [])

  const onSuccess = () => {
    queryClient.resetQueries([wallet.id, 'stakingInfo'])
    resetToTxHistory()
  }

  const fee = formatTokenAmount(
    yoroiUnsignedTx.fee[wallet.portfolioPrimaryTokenInfo.id],
    wallet.portfolioPrimaryTokenInfo,
  )

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
            {`+ ${fee} ${strings.ofFees}`}
          </Text>

          {/* requires a handler so we pass on a dummy function */}

          <ValidatedTextInput
            onChangeText={() => undefined}
            editable={false}
            value={formatTokenAmount(stakingAmount.quantity, wallet.portfolioPrimaryTokenInfo)}
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
        </View>

        {meta.isHW && <HWInstructions useUSB={useUSB} addMargin />}
      </ScrollView>

      <Space height="lg" />

      <ConfirmTx
        buttonProps={{
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
      backgroundColor: color.bg_color_max,
      ...atoms.px_lg,
      ...atoms.pb_2xl,
      flex: 1,
    },
    itemBlock: {
      ...atoms.pt_2xl,
    },
    heading: {
      color: color.gray_900,
      ...atoms.body_1_lg_medium,
    },
    text: {
      color: color.gray_900,
      ...atoms.body_2_md_regular,
    },
    fees: {
      textAlign: 'right',
      color: color.gray_900,
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
