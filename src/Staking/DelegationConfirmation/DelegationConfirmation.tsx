import {BigNumber} from 'bignumber.js'
import React, {useEffect, useState} from 'react'
import {defineMessages, useIntl} from 'react-intl'
import {ScrollView, StyleSheet, View, ViewProps} from 'react-native'

import {Text, ValidatedTextInput} from '../../components'
import {ConfirmTx} from '../../components/ConfirmTx'
import {useStakePoolInfoAndHistory} from '../../Dashboard/StakePoolInfo'
import {Instructions as HWInstructions} from '../../HW'
import globalMessages, {txLabels} from '../../i18n/global-messages'
import {CONFIG} from '../../legacy/config'
import {formatTokenAmount, formatTokenWithText} from '../../legacy/format'
import {useParams, useWalletNavigation} from '../../navigation'
import {StakingCenterRoutes} from '../../navigation'
import {useSelectedWallet} from '../../SelectedWallet'
import {COLORS} from '../../theme'
import {Quantity} from '../../yoroi-wallets/types'
import {Amounts, Entries, Quantities} from '../../yoroi-wallets/utils'

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
  const wallet = useSelectedWallet()
  const strings = useStrings()

  const {poolId, yoroiUnsignedTx} = useParams<Params>(isParams)

  if (!yoroiUnsignedTx.staking?.delegations) throw new Error('invalid transaction')
  const stakingAmount = Amounts.getAmount(Entries.toAmounts(yoroiUnsignedTx.staking.delegations), '')
  const reward = approximateReward(stakingAmount.quantity)

  const [password, setPassword] = useState('')
  const [useUSB, setUseUSB] = useState(false)

  useEffect(() => {
    if (CONFIG.DEBUG.PREFILL_FORMS && __DEV__) setPassword(CONFIG.DEBUG.PASSWORD)
  }, [])

  const onSuccess = () => {
    resetToTxHistory()
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.itemBlock}>
          <Text style={styles.itemTitle}>{strings.stakePoolName}</Text>
          <StakePoolName stakePoolId={poolId} />
        </View>

        <View style={styles.itemBlock}>
          <Text style={styles.itemTitle}>{strings.stakePoolHash}</Text>
          <Text testID="stakePoolHashText">{poolId}</Text>
        </View>

        <View style={styles.input} testID="stakingAmount">
          <Text small style={styles.fees}>
            {`+ ${formatTokenAmount(new BigNumber(yoroiUnsignedTx.fee['']), wallet.defaultAsset)} ${strings.ofFees}`}
          </Text>

          {/* requires a handler so we pass on a dummy function */}
          <ValidatedTextInput
            onChangeText={() => undefined}
            editable={false}
            value={formatTokenAmount(new BigNumber(stakingAmount.quantity), wallet.defaultAsset)}
            label={strings.amount}
          />
        </View>

        {!wallet.isEasyConfirmationEnabled && !wallet.isHW && (
          <View style={styles.input} testID="spendingPassword">
            <ValidatedTextInput secureTextEntry value={password} label={strings.password} onChangeText={setPassword} />
          </View>
        )}

        <View style={styles.itemBlock}>
          <Text style={styles.itemTitle}>{strings.rewardsExplanation}</Text>
          <Text style={styles.rewards}>{formatTokenWithText(new BigNumber(reward), wallet.defaultAsset)}</Text>
        </View>

        {wallet.isHW && <HWInstructions useUSB={useUSB} addMargin />}
      </ScrollView>

      <Actions>
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
        />
      </Actions>
    </View>
  )
}

const Actions = (props: ViewProps) => <View {...props} style={{padding: 16}} />

const StakePoolName = ({stakePoolId}: {stakePoolId: string}) => {
  const strings = useStrings()
  const wallet = useSelectedWallet()
  const {stakePoolInfoAndHistory, isLoading, error} = useStakePoolInfoAndHistory({wallet, stakePoolId})

  return <Text>{isLoading ? '...' : error ? strings.unknownPool : stakePoolInfoAndHistory?.info.name}</Text>
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
const approximateReward = (stakedQuantity: Quantity): Quantity => {
  return Quantities.quotient(
    Quantities.product([stakedQuantity, `${CONFIG.NETWORKS.HASKELL_SHELLEY.PER_EPOCH_PERCENTAGE_REWARD}`]),
    CONFIG.NUMBERS.EPOCH_REWARD_DENOMINATOR.toString() as Quantity,
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
  },
  scrollView: {
    paddingHorizontal: 16,
    paddingBottom: 24,
    flex: 1,
  },
  itemBlock: {
    marginTop: 24,
  },
  itemTitle: {
    fontSize: 14,
    lineHeight: 22,
    color: '#353535',
  },
  input: {
    marginTop: 16,
  },
  rewards: {
    marginTop: 5,
    fontSize: 16,
    lineHeight: 19,
    color: COLORS.SHELLEY_BLUE,
    fontWeight: '500',
  },
  fees: {
    textAlign: 'right',
    color: '#353535',
  },
})
