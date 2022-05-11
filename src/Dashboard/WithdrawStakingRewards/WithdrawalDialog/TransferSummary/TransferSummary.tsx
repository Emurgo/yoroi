import {BigNumber} from 'bignumber.js'
import React from 'react'
import {defineMessages, useIntl} from 'react-intl'
import {Linking, StyleSheet, TouchableOpacity, View} from 'react-native'

import {Text, TextInput, TwoActionView} from '../../../../components'
import {useTokenInfo} from '../../../../hooks'
import {Instructions as HWInstructions} from '../../../../HW'
import {confirmationMessages, txLabels} from '../../../../i18n/global-messages'
import {CONFIG} from '../../../../legacy/config'
import {formatTokenWithText} from '../../../../legacy/format'
import {getNetworkConfigById} from '../../../../legacy/networks'
import {useSelectedWallet} from '../../../../SelectedWallet'
import {COLORS} from '../../../../theme'
import {diffEntries, sumEntries, YoroiEntries, YoroiUnsignedTx} from '../../../../yoroi-wallets'

type Props = {
  unsignedTx: YoroiUnsignedTx
  onConfirm: (password?: string | undefined) => void
  onCancel: () => void
  useUSB?: boolean
}

export const TransferSummary = ({unsignedTx, onConfirm, onCancel, useUSB}: Props) => {
  const strings = useStrings()
  const wallet = useSelectedWallet()
  const [password, setPassword] = React.useState(CONFIG.DEBUG.PREFILL_FORMS ? CONFIG.DEBUG.PASSWORD : '')

  const rewards = sumEntries(Object.values(unsignedTx.staking.withdrawals))
  const deregistrations = sumEntries(Object.values(unsignedTx.staking.deregistrations))
  // withdraws + deregistrations - fee
  const total = diffEntries(sumEntries([rewards, deregistrations]), unsignedTx.fee)
  const tokenInfo = useTokenInfo({wallet, tokenId: ''})

  return (
    <TwoActionView
      title={strings.confirmTx}
      primaryButton={{
        label: strings.confirmButton,
        onPress: () => onConfirm(password),
      }}
      secondaryButton={{onPress: () => onCancel()}}
    >
      <Item>
        <Text>{strings.balanceLabel}</Text>
        <Text style={styles.balanceAmount}>{formatTokenWithText(new BigNumber(rewards[''] || '0'), tokenInfo)}</Text>
      </Item>

      <Item>
        <Text>{strings.fees}</Text>
        <Text style={styles.balanceAmount}>
          {formatTokenWithText(new BigNumber(unsignedTx.fee[''] || '0'), tokenInfo)}
        </Text>
      </Item>

      <Item>
        <Text>{strings.finalBalanceLabel}</Text>
        <Text style={styles.balanceAmount}>{formatTokenWithText(new BigNumber(total[''] || '0'), tokenInfo)}</Text>
      </Item>

      {Object.keys(unsignedTx.staking.withdrawals).length > 0 && (
        <Withdrawals withdrawals={unsignedTx.staking.withdrawals} />
      )}

      {Object.keys(unsignedTx.staking.deregistrations).length > 0 && (
        <Deregistrations deregistrations={unsignedTx.staking.deregistrations} />
      )}

      {wallet.isHW && <HWInstructions useUSB={useUSB} addMargin />}

      {!wallet.isEasyConfirmationEnabled && !wallet.isHW && (
        <View style={styles.input}>
          <PasswordInput
            secureTextEntry
            value={password}
            label={strings.password}
            onChangeText={setPassword}
            autoComplete={false}
          />
        </View>
      )}
    </TwoActionView>
  )
}

const Withdrawals: React.FC<{withdrawals: YoroiEntries}> = ({withdrawals}) => {
  const wallet = useSelectedWallet()
  const strings = useStrings()

  return (
    <Item>
      <Text>{strings.withdrawals}</Text>
      {Object.keys(withdrawals).map((address) => (
        <TouchableOpacity
          key={address}
          activeOpacity={0.5}
          onPress={() => Linking.openURL(getNetworkConfigById(wallet.networkId).EXPLORER_URL_FOR_ADDRESS(address))}
        >
          <Text secondary>{address}</Text>
        </TouchableOpacity>
      ))}
    </Item>
  )
}

const Deregistrations: React.FC<{deregistrations: YoroiEntries}> = ({deregistrations}) => {
  const wallet = useSelectedWallet()
  const strings = useStrings()
  const tokenInfo = useTokenInfo({wallet, tokenId: ''})
  const totalRefund = sumEntries(Object.values(deregistrations).flat())
  const refundAmount = formatTokenWithText(new BigNumber(totalRefund[''] || '0'), tokenInfo)

  return (
    <>
      <Item>
        <Text>{strings.stakeDeregistration}</Text>
        {Object.keys(deregistrations).map((address) => (
          <TouchableOpacity
            key={address}
            activeOpacity={0.5}
            onPress={() => Linking.openURL(getNetworkConfigById(wallet.networkId).EXPLORER_URL_FOR_ADDRESS(address))}
          >
            <Text secondary>{address}</Text>
          </TouchableOpacity>
        ))}
      </Item>

      <Item>
        <Text>{strings.unregisterExplanation({refundAmount})}</Text>
      </Item>
    </>
  )
}

const Item = (props) => <View {...props} style={styles.item} />
const PasswordInput = TextInput

const useStrings = () => {
  const intl = useIntl()

  return {
    fromLabel: intl.formatMessage(messages.fromLabel),
    balanceLabel: intl.formatMessage(messages.balanceLabel),
    confirmButton: intl.formatMessage(confirmationMessages.commonButtons.confirmButton),
    finalBalanceLabel: intl.formatMessage(messages.finalBalanceLabel),
    unregisterExplanation: (args) => intl.formatMessage(messages.unregisterExplanation, args),

    confirmTx: intl.formatMessage(txLabels.confirmTx),
    password: intl.formatMessage(txLabels.password),
    fees: intl.formatMessage(txLabels.fees),
    withdrawals: intl.formatMessage(txLabels.withdrawals),
    stakeDeregistration: intl.formatMessage(txLabels.stakeDeregistration),
  }
}

const messages = defineMessages({
  fromLabel: {
    id: 'components.walletinit.restorewallet.upgradeconfirmmodal.fromLabel',
    defaultMessage: '!!!From',
  },
  balanceLabel: {
    id: 'components.walletinit.restorewallet.upgradeconfirmmodal.balanceLabel',
    defaultMessage: '!!!Recovered balance',
  },
  finalBalanceLabel: {
    id: 'components.walletinit.restorewallet.upgradeconfirmmodal.finalBalanceLabel',
    defaultMessage: '!!!Final balance',
  },
  unregisterExplanation: {
    id: 'components.transfer.transfersummarymodal.unregisterExplanation',
    defaultMessage:
      '!!!This transaction will unregister one or more staking ' +
      'keys, giving you back your {refundAmount} from your deposit',
  },
})

const styles = StyleSheet.create({
  item: {
    paddingBottom: 5,
  },
  input: {
    paddingTop: 16,
  },
  balanceAmount: {
    color: COLORS.POSITIVE_AMOUNT,
    lineHeight: 24,
    fontSize: 16,
  },
})
