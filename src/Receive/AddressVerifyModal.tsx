import React from 'react'
import {defineMessages, useIntl} from 'react-intl'
import {ActivityIndicator, ScrollView, View} from 'react-native'
import {StyleSheet} from 'react-native'

import {Button, Modal, Text} from '../components'
import {Instructions as HWInstructions} from '../HW'
import {confirmationMessages} from '../i18n/global-messages'
import {COLORS, spacing} from '../theme'

type Props = {
  visible: boolean
  onConfirm: () => void
  onRequestClose: () => void
  address: string
  path: string
  isWaiting: boolean
  useUSB: boolean
}

export const AddressVerifyModal = ({visible, onConfirm, onRequestClose, address, path, isWaiting, useUSB}: Props) => {
  const strings = useStrings()

  return (
    <Modal visible={visible} onRequestClose={onRequestClose} showCloseIcon>
      <ScrollView style={styles.scrollView}>
        <View style={styles.heading}>
          <Text style={styles.title}>{strings.title}</Text>
        </View>

        <HWInstructions useUSB={useUSB} />

        <Text style={styles.paragraph}>{strings.afterConfirm}</Text>

        <View style={styles.addressDetailsView}>
          <Text secondary style={styles.paragraph}>
            {address}
          </Text>

          <Text secondary style={styles.paragraph}>
            {path}
          </Text>
        </View>

        <Button onPress={onConfirm} title={strings.confirmButton} style={styles.button} disabled={isWaiting} />

        {isWaiting && <ActivityIndicator color="black" />}
      </ScrollView>
    </Modal>
  )
}

const messages = defineMessages({
  title: {
    id: 'components.receive.addressverifymodal.title',
    defaultMessage: '!!!Verify Address on Ledger',
  },
  afterConfirm: {
    id: 'components.receive.addressverifymodal.afterConfirm',
    defaultMessage:
      '!!!Once you tap on confirm, validate the address on your Ledger ' +
      'device, making sure both the path and the address match what is shown ' +
      'below:',
  },
})

const useStrings = () => {
  const intl = useIntl()

  return {
    title: intl.formatMessage(messages.title),
    afterConfirm: intl.formatMessage(messages.afterConfirm),
    confirmButton: intl.formatMessage(confirmationMessages.commonButtons.confirmButton),
  }
}

const styles = StyleSheet.create({
  scrollView: {
    paddingRight: 10,
    marginBottom: 12,
  },
  paragraph: {
    marginBottom: 12,
    fontSize: 14,
    lineHeight: 22,
  },
  heading: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    lineHeight: 22,
    fontWeight: 'bold',
    marginBottom: spacing.paragraphBottomMargin,
  },
  button: {
    marginHorizontal: 10,
  },
  addressDetailsView: {
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 1,
    shadowOffset: {width: 2, height: 2},
    shadowRadius: 12,
    shadowOpacity: 1,
    shadowColor: COLORS.SHADOW_COLOR,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 10,
    padding: 8,
  },
})
