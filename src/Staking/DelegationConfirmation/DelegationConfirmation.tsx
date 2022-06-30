/* eslint-disable @typescript-eslint/no-explicit-any */
import {BigNumber} from 'bignumber.js'
import React, {useEffect, useState} from 'react'
import {defineMessages, useIntl} from 'react-intl'
import {ScrollView, StyleSheet, View, ViewProps} from 'react-native'
import {useSelector} from 'react-redux'

import {OfflineBanner, Text, ValidatedTextInput} from '../../components'
import {ConfirmTx} from '../../components/ConfirmTx'
import {Instructions as HWInstructions} from '../../HW'
import globalMessages, {txLabels} from '../../i18n/global-messages'
import {CONFIG} from '../../legacy/config'
import {formatTokenAmount, formatTokenWithText} from '../../legacy/format'
import {defaultNetworkAssetSelector} from '../../legacy/selectors'
import {useParams, useWalletNavigation} from '../../navigation'
import {useSelectedWallet} from '../../SelectedWallet'
import {COLORS} from '../../theme'
import {DefaultAsset} from '../../types'
import {Quantity, YoroiUnsignedTx} from '../../yoroi-wallets/types'
import {Amounts, Entries, Quantities} from '../../yoroi-wallets/utils'

export type Params = {
  poolHash: string
  poolName: string
  yoroiTx: YoroiUnsignedTx
}

const isParams = (params?: Params | object | undefined): params is Params => {
  return (
    !!params &&
    'yoroiTx' in params &&
    typeof params.yoroiTx === 'object' &&
    'poolHash' in params &&
    typeof params.poolHash === 'string' &&
    'poolName' in params &&
    typeof params.poolHash === 'string'
  )
}

export const DelegationConfirmation = ({mockDefaultAsset}: {mockDefaultAsset?: DefaultAsset}) => {
  const {resetToTxHistory} = useWalletNavigation()
  const wallet = useSelectedWallet()
  const defaultNetworkAsset = useSelector(defaultNetworkAssetSelector)
  const defaultAsset = mockDefaultAsset || defaultNetworkAsset
  const strings = useStrings()

  const {poolHash, poolName, yoroiTx} = useParams<Params>(isParams)
  if (!yoroiTx.staking?.delegations) throw new Error('invalid transaction')
  const stakingAmount = Amounts.getAmount(Entries.toAmounts(yoroiTx.staking.delegations), '')
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
      <OfflineBanner />

      <ScrollView style={styles.scrollView}>
        <View style={styles.itemBlock}>
          <Text style={styles.itemTitle}>{strings.stakePoolName}</Text>
          <Text>{poolName}</Text>
        </View>

        <View style={styles.itemBlock}>
          <Text style={styles.itemTitle}>{strings.stakePoolHash}</Text>
          <Text>{poolHash}</Text>
        </View>

        <View style={styles.input}>
          <Text small style={styles.fees}>
            {`+ ${formatTokenAmount(new BigNumber(yoroiTx.fee['']), defaultAsset)} ${strings.ofFees}`}
          </Text>

          {/* requires a handler so we pass on a dummy function */}
          <ValidatedTextInput
            onChangeText={() => undefined}
            editable={false}
            value={formatTokenAmount(new BigNumber(stakingAmount.quantity), defaultAsset)}
            label={strings.amount}
          />
        </View>

        {!wallet.isEasyConfirmationEnabled && !wallet.isHW && (
          <View style={styles.input}>
            <ValidatedTextInput secureTextEntry value={password} label={strings.password} onChangeText={setPassword} />
          </View>
        )}

        <View style={styles.itemBlock}>
          <Text style={styles.itemTitle}>{strings.rewardsExplanation}</Text>
          <Text style={styles.rewards}>{formatTokenWithText(new BigNumber(reward), defaultAsset)}</Text>
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
          txDataSignRequest={yoroiTx}
        />
      </Actions>
    </View>
  )
}

const Actions = (props: ViewProps) => <View {...props} style={{padding: 16}} />

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
