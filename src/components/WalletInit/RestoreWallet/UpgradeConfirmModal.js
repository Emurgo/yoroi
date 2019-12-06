// @flow

import React from 'react'
import {compose} from 'redux'
import {withHandlers} from 'recompose'
import {View, TouchableOpacity, ScrollView, Image, Linking} from 'react-native'
import {injectIntl, defineMessages, intlShape} from 'react-intl'
import {withNavigation} from 'react-navigation'
import {BigNumber} from 'bignumber.js'

import type {Navigation} from '../../../types/navigation'
import {Text, Button, Modal} from '../../UiKit'
import {formatAdaWithText} from '../../../utils/format'
import {confirmationMessages} from '../../../i18n/global-messages'
import {CARDANO_CONFIG} from '../../../config'

import styles from './styles/UpgradeCheckModal.style'
import imageEmpty from '../../../assets/img/no_transactions_yet.inline.png'
import imageSucess from '../../../assets/img/transfer-success.inline.png'

import type {ComponentType} from 'react'

const messages = defineMessages({
  title: {
    id: 'components.walletinit.restorewallet.upgradeconfirmmodal.title',
    defaultMessage: '!!!Wallet upgrade',
  },
  noUpgradeLabel: {
    id: 'components.walletinit.restorewallet.upgradeconfirmmodal.noUpgradeLabel',
    defaultMessage: '!!!All done!',
  },
  noUpgradeMessage: {
    id: 'components.walletinit.restorewallet.upgradeconfirmmodal.noUpgradeMessage',
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
    id: 'components.walletinit.restorewallet.upgradeconfirmmodal.finalBalanceLabel',
    defaultMessage: '!!!Final balance',
  },
  feesLabel: {
    id: 'components.walletinit.restorewallet.upgradeconfirmmodal.feesLabel',
    defaultMessage: '!!!Fees',
  },
})

const AddressEntry = withHandlers({
  onPress: ({address}) => () => {
    Linking.openURL(CARDANO_CONFIG.SHELLEY.EXPLORER_URL_FOR_ADDRESS(address))
  },
})(({address, onPress}) => {
  return (
    <TouchableOpacity activeOpacity={0.5} onPress={onPress}>
      <Text secondary>{address}</Text>
    </TouchableOpacity>
  )
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
        <Modal visible={visible} onRequestClose={onRequestClose} showCloseIcon>
          <ScrollView style={styles.scrollView}>
            <View style={styles.content}>
              <View style={styles.heading}>
                <Image source={imageSucess} />
                <Text style={styles.title} small>
                  {intl.formatMessage(messages.title)}
                </Text>
              </View>
              <View style={styles.item}>
                <Text style={styles.label} small>
                  {intl.formatMessage(messages.balanceLabel)}
                </Text>
                <Text style={styles.balanceAmount}>
                  {balance && formatAdaWithText(balance)}
                </Text>
              </View>
              <View style={styles.item}>
                <Text style={styles.label} small>
                  {intl.formatMessage(messages.feesLabel)}
                </Text>
                <Text style={styles.balanceAmount}>
                  {balance && formatAdaWithText(fees)}
                </Text>
              </View>
              <View style={styles.item}>
                <Text style={styles.label} small>
                  {intl.formatMessage(messages.finalBalanceLabel)}
                </Text>
                <Text style={styles.balanceAmount}>
                  {balance && formatAdaWithText(finalBalance)}
                </Text>
              </View>
              <View style={styles.item}>
                <Text style={styles.label} small>
                  {intl.formatMessage(messages.fromLabel)}
                </Text>
                {byronAddresses.map((address, i) => (
                  <AddressEntry key={i} address={address} />
                ))}
              </View>
              <View style={styles.item}>
                <Text style={styles.label} small>
                  {intl.formatMessage(messages.toLabel)}
                </Text>
                <AddressEntry address={shelleyAddress} />
              </View>
            </View>
            <View style={styles.buttons}>
              <Button
                block
                outlineOnLight
                onPress={onCancel}
                // title={intl.formatMessage(confirmationMessages.commonButtons.cancelButton.defaultMessage)}
                title={confirmationMessages.commonButtons.cancelButton.defaultMessage}
                style={styles.skipButton}
              />

              <Button
                block
                onPress={onConfirm}
                // title={intl.formatMessage(confirmationMessages.commonButtons.confirmButton)}
                title={confirmationMessages.commonButtons.confirmButton.defaultMessage}
                style={styles.checkButton}
              />
            </View>
          </ScrollView>
        </Modal>
      )
    } else {
      return (
        <Modal visible={visible} onRequestClose={onRequestClose} showCloseIcon>
          <ScrollView style={styles.scrollView}>
            <View style={[styles.content, styles.empty]}>
              <Image source={imageEmpty} />
              <Text>{intl.formatMessage(messages.recoveryEmptyMessage)}</Text>
            </View>
            <Button
              onPress={onContinue}
              title={intl.formatMessage(messages.recoveryEmptyButtonText)}
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
