// @flow

import {BigNumber} from 'bignumber.js'
import React from 'react'
import {type IntlShape, defineMessages, injectIntl} from 'react-intl'
import {View} from 'react-native'
import {useSelector} from 'react-redux'

import {CONFIG} from '../../config/config'
import {getNetworkConfigById} from '../../config/networks'
import {MultiToken} from '../../crypto/MultiToken'
import {confirmationMessages, txLabels} from '../../i18n/global-messages'
import {defaultNetworkAssetSelector, walletMetaSelector} from '../../selectors'
import {formatTokenWithText} from '../../utils/format'
import AddressEntry from '../Common/AddressEntry'
import TwoActionView from '../Common/TwoActionView'
import HWInstructions from '../Ledger/HWInstructions'
import {Text, TextInput} from '../UiKit'
import styles from './styles/TransferSummary.style'

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

type Props = {
  +intl: IntlShape,
  +withdrawals?: Array<{|
    +address: string,
    +amount: MultiToken,
  |}>,
  +deregistrations?: Array<{|
    +rewardAddress: string,
    +refund: MultiToken,
  |}>,
  +balance: BigNumber,
  +finalBalance: BigNumber,
  +fees: BigNumber,
  +onConfirm: (event: Object, password?: string | void) => any,
  +onCancel: () => any,
  +useUSB?: boolean,
}

const TransferSummary = ({
  intl,
  withdrawals,
  deregistrations,
  balance,
  finalBalance,
  fees,
  onConfirm,
  onCancel,
  useUSB,
}: Props) => {
  const walletMeta = useSelector(walletMetaSelector)
  const defaultAsset = useSelector(defaultNetworkAssetSelector)
  const [password, setPassword] = React.useState(CONFIG.DEBUG.PREFILL_FORMS ? CONFIG.DEBUG.PASSWORD : '')

  return (
    <TwoActionView
      title={intl.formatMessage(txLabels.confirmTx)}
      primaryButton={{
        label: intl.formatMessage(confirmationMessages.commonButtons.confirmButton),
        onPress: (event) => onConfirm(event, password),
      }}
      secondaryButton={{onPress: () => onCancel()}}
    >
      <Item>
        <Text>{intl.formatMessage(messages.balanceLabel)}</Text>
        <Text style={styles.balanceAmount}>{formatTokenWithText(balance, defaultAsset)}</Text>
      </Item>

      <Item>
        <Text>{intl.formatMessage(txLabels.fees)}</Text>
        <Text style={styles.balanceAmount}>{formatTokenWithText(fees, defaultAsset)}</Text>
      </Item>

      <Item>
        <Text>{intl.formatMessage(messages.finalBalanceLabel)}</Text>
        <Text style={styles.balanceAmount}>{formatTokenWithText(finalBalance, defaultAsset)}</Text>
      </Item>

      {withdrawals != null && withdrawals.length > 0 && (
        <Item>
          <Text>{intl.formatMessage(txLabels.withdrawals)}</Text>
          {withdrawals.map((withdrawal, i) => (
            <AddressEntry
              key={i}
              address={withdrawal.address}
              explorerForAddress={getNetworkConfigById(walletMeta.networkId).EXPLORER_URL_FOR_ADDRESS}
            />
          ))}
        </Item>
      )}

      {deregistrations != null && deregistrations.length > 0 && (
        <>
          <Item>
            <Text>{intl.formatMessage(txLabels.stakeDeregistration)}</Text>
            {deregistrations.map((deregistration, i) => (
              <AddressEntry
                key={i}
                address={deregistration.rewardAddress}
                explorerForAddress={getNetworkConfigById(walletMeta.networkId).EXPLORER_URL_FOR_ADDRESS}
              />
            ))}
          </Item>

          <Item>
            <Text>
              {intl.formatMessage(messages.unregisterExplanation, {
                refundAmount: formatTokenWithText(
                  deregistrations
                    .reduce(
                      (sum, curr) => (curr.refund == null ? sum : sum.joinAddCopy(curr.refund)),
                      new MultiToken([], {
                        defaultNetworkId: defaultAsset.networkId,
                        defaultIdentifier: defaultAsset.identifier,
                      }),
                    )
                    .getDefault(),
                  defaultAsset,
                ).toString(),
              })}
            </Text>
          </Item>
        </>
      )}

      {/* $FlowFixMe */}
      {walletMeta.isHW && <HWInstructions useUSB={useUSB} addMargin />}

      {!walletMeta.isEasyConfirmationEnabled && !walletMeta.isHW && (
        <View style={styles.input}>
          <PasswordInput
            secureTextEntry
            value={password}
            label={intl.formatMessage(txLabels.password)}
            onChangeText={setPassword}
          />
        </View>
      )}
    </TwoActionView>
  )
}

export default injectIntl(TransferSummary)

const Item = (props) => <View {...props} style={styles.item} />
const PasswordInput = TextInput
