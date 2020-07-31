// @flow

import React from 'react'
import {View} from 'react-native'
import {injectIntl, defineMessages, intlShape} from 'react-intl'

import AddressEntry from '../../Common/AddressEntry'
import {Text, Button, Modal} from '../../UiKit'
import {confirmationMessages} from '../../../i18n/global-messages'
import {CONFIG} from '../../../config/config'

import styles from './styles/WalletVerifyModal.style'

const renderBulletPointItem = (textRow) => {
  return (
    <Text style={styles.text}>
      {'\u2022'} {textRow}
    </Text>
  )
}

const messages = defineMessages({
  title: {
    id: 'components.walletinit.restorewallet.walletverifyscreen.title',
    defaultMessage: '!!!Verify restored wallet',
  },
  verifyLabel: {
    id: 'components.walletinit.restorewallet.walletverifyscreen.verifyLabel',
    defaultMessage: '!!!Be careful about wallet restoration:',
  },
  verifyInstructions1: {
    id:
      'components.walletinit.restorewallet.walletverifyscreen.verifyInstructions1',
    defaultMessage:
      '!!!Make sure the Byron wallet address matches your old wallet.',
  },
  verifyInstructions2: {
    id:
      'components.walletinit.restorewallet.walletverifyscreen.verifyInstructions2',
    defaultMessage:
      '!!!If you entered the wrong recovery phrase, you will get an empty ' +
      'wallet with different addresses from your old one.',
  },
  byronAddressesLabel: {
    id:
      'components.walletinit.restorewallet.walletverifyscreen.byronAddressLabel',
    defaultMessage: '!!!Byron wallet address:',
  },
  shelleyAddressesLabel: {
    id:
      'components.walletinit.restorewallet.walletverifyscreen.shelleyAddressLabel',
    defaultMessage: '!!!Shelley wallet address:',
  },
})

type Props = {
  intl: intlShape,
  visible: boolean,
  onConfirm: () => void,
  onBack: () => void,
  byronAddress: string,
  shelleyAddress: string,
  onRequestClose: () => any,
}

const WalletVerifyModal = ({
  intl,
  visible,
  onConfirm,
  onBack,
  byronAddress,
  shelleyAddress,
  onRequestClose,
}: Props) => {
  return (
    <Modal visible={visible} onRequestClose={onRequestClose}>
      <View style={styles.content}>
        <Text style={styles.title}>{intl.formatMessage(messages.title)}</Text>

        <Text style={[styles.label, styles.text]}>
          {intl.formatMessage(messages.verifyLabel)}
        </Text>
        {renderBulletPointItem(
          intl.formatMessage(messages.verifyInstructions1),
        )}
        {renderBulletPointItem(
          intl.formatMessage(messages.verifyInstructions2),
        )}

        <Text style={[styles.label, styles.text]}>
          {intl.formatMessage(messages.byronAddressesLabel)}
        </Text>
        <AddressEntry
          address={byronAddress}
          explorerForAddress={
            CONFIG.NETWORKS.JORMUNGANDR.EXPLORER_URL_FOR_ADDRESS
          }
        />
        <Text style={[styles.label, styles.text]}>
          {intl.formatMessage(messages.shelleyAddressesLabel)}
        </Text>
        <AddressEntry
          address={shelleyAddress}
          explorerForAddress={
            CONFIG.NETWORKS.JORMUNGANDR.EXPLORER_URL_FOR_ADDRESS
          }
        />
      </View>

      <View style={styles.buttons}>
        <Button
          block
          outlineShelley
          onPress={onBack}
          title={intl.formatMessage(
            confirmationMessages.commonButtons.backButton,
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
    </Modal>
  )
}

export default injectIntl(WalletVerifyModal)
