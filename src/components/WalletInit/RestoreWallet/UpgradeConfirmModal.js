// @flow

import React from 'react'
import {compose} from 'redux'
import {withHandlers} from 'recompose'
import {View, ScrollView, Image} from 'react-native'
import {injectIntl, defineMessages, intlShape} from 'react-intl'
import {withNavigation} from 'react-navigation'
import {BigNumber} from 'bignumber.js'

import AddressEntry from '../../Common/AddressEntry'
import type {Navigation} from '../../../types/navigation'
import {Text, Button, Modal} from '../../UiKit'
import {formatAdaWithText} from '../../../utils/format'
import {confirmationMessages} from '../../../i18n/global-messages'

import styles from './styles/UpgradeConfirmModal.style'
import imageSucess from '../../../assets/img/transfer-success.inline.png'

import type {ComponentType} from 'react'

const messages = defineMessages({
  title: {
    id: 'components.walletinit.restorewallet.upgradeconfirmmodal.title',
    defaultMessage: '!!!Wallet upgrade',
  },
  noUpgradeLabel: {
    id:
      'components.walletinit.restorewallet.upgradeconfirmmodal.noUpgradeLabel',
    defaultMessage: '!!!All done!',
  },
  noUpgradeMessage: {
    id:
      'components.walletinit.restorewallet.upgradeconfirmmodal.noUpgradeMessage',
    defaultMessage: '!!!Your wallet did not need to be upgraded',
  },
  fromLabel: {
    id: 'components.walletinit.restorewallet.upgradeconfirmmodal.fromLabel',
    defaultMessage: '!!!From:',
  },
  toLabel: {
    id: 'components.walletinit.restorewallet.upgradeconfirmmodal.toLabel',
    defaultMessage: '!!!To:',
  },
  balanceLabel: {
    id: 'components.walletinit.restorewallet.upgradeconfirmmodal.balanceLabel',
    defaultMessage: '!!!Recovered balance',
  },
  finalBalanceLabel: {
    id:
      'components.walletinit.restorewallet.upgradeconfirmmodal.finalBalanceLabel',
    defaultMessage: '!!!Final balance',
  },
  feesLabel: {
    id: 'components.walletinit.restorewallet.upgradeconfirmmodal.feesLabel',
    defaultMessage: '!!!Fees',
  },
})

type Props = {
  intl: any,
  visible: boolean,
  byronAddresses: Array<string>,
  shelleyAddress: string,
  balance: BigNumber,
  finalBalance: BigNumber,
  fees: BigNumber,
  onCancel: () => any,
  onConfirm: () => any,
  onContinue: () => any,
  onRequestClose: () => any,
}

class UpgradeConfirmModal extends React.Component<Props> {
  render() {
    const {
      intl,
      visible,
      byronAddresses,
      shelleyAddress,
      balance,
      finalBalance,
      fees,
      onCancel,
      onConfirm,
      onContinue,
      onRequestClose,
    } = this.props

    if (byronAddresses.length > 0) {
      return (
        <Modal visible={visible} onRequestClose={onRequestClose}>
          <ScrollView style={styles.scrollView}>
            <View style={styles.content}>
              <View style={styles.heading}>
                <Text style={styles.title}>
                  {intl.formatMessage(messages.title)}
                </Text>
                <Image source={imageSucess} />
              </View>
              <View style={styles.item}>
                <Text>{intl.formatMessage(messages.balanceLabel)}</Text>
                <Text style={styles.balanceAmount}>
                  {formatAdaWithText(balance)}
                </Text>
              </View>
              <View style={styles.item}>
                <Text>{intl.formatMessage(messages.feesLabel)}</Text>
                <Text style={styles.balanceAmount}>
                  {formatAdaWithText(fees)}
                </Text>
              </View>
              <View style={styles.item}>
                <Text>{intl.formatMessage(messages.finalBalanceLabel)}</Text>
                <Text style={styles.balanceAmount}>
                  {formatAdaWithText(finalBalance)}
                </Text>
              </View>
              <View style={styles.item}>
                <Text>{intl.formatMessage(messages.fromLabel)}</Text>
                {byronAddresses.map((address, i) => (
                  <AddressEntry key={i} address={address} />
                ))}
              </View>
              <View style={styles.item}>
                <Text>{intl.formatMessage(messages.toLabel)}</Text>
                <AddressEntry address={shelleyAddress} />
              </View>
            </View>
            <View style={styles.buttons}>
              <Button
                block
                outlineShelley
                onPress={onCancel}
                title={intl.formatMessage(
                  confirmationMessages.commonButtons.cancelButton,
                )}
                style={styles.leftButton}
              />
              <Button
                block
                onPress={onConfirm}
                title={intl.formatMessage(
                  confirmationMessages.commonButtons.confirmButton,
                )}
                shelleyTheme
                style={styles.rightButton}
              />
            </View>
          </ScrollView>
        </Modal>
      )
    } else {
      return (
        <Modal visible={visible} onRequestClose={onRequestClose}>
          <ScrollView style={styles.scrollView}>
            <View style={styles.content}>
              <View style={styles.heading}>
                <Image source={imageSucess} />
                <Text style={styles.title}>
                  {intl.formatMessage(messages.noUpgradeLabel)}
                </Text>
              </View>
              <Text>{intl.formatMessage(messages.noUpgradeMessage)}</Text>
            </View>
            <Button
              onPress={onContinue}
              title={intl.formatMessage(
                confirmationMessages.commonButtons.continueButton,
              )}
              shelleyTheme
            />
          </ScrollView>
        </Modal>
      )
    }
  }
}

type ExternalProps = {
  intl: intlShape,
  navigation: Navigation,
}

export default injectIntl(
  (compose(
    withNavigation,
    withHandlers({
      buttonHandler: ({navigation}) => (event) => navigation.popToTop(),
    }),
  )(UpgradeConfirmModal): ComponentType<ExternalProps>),
)
