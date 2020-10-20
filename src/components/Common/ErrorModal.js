// @flow

import React from 'react'
import {Text, View, Image, TouchableOpacity, ScrollView} from 'react-native'
import {injectIntl, defineMessages} from 'react-intl'
import {compose} from 'redux'
import {withStateHandlers} from 'recompose'

import {Modal, Button} from '../UiKit'
import globalMessages from '../../i18n/global-messages'
import chevronRight from '../../assets/img/chevron_right.png'
import chevronLeft from '../../assets/img/chevron_left.png'
import image from '../../assets/img/error.png'

import styles from './styles/ErrorModal.style'

import type {ComponentType} from 'react'

const messages = defineMessages({
  showError: {
    id: 'components.common.errormodal.showError',
    defaultMessage: '!!!Show error message',
  },
  hideError: {
    id: 'components.common.errormodal.hideError',
    defaultMessage: '!!!Hide error message',
  },
})

const ErrorModal = ({
  intl,
  visible,
  title,
  message,
  showErrorMessage,
  setShowErrorMessage,
  errorMessage,
  onRequestClose,
}) => (
  <Modal visible={visible} onRequestClose={onRequestClose} showCloseIcon>
    <ScrollView style={styles.scrollView}>
      <View style={styles.headerView}>
        <Text style={styles.title}>{title}</Text>
        <Image source={image} style={styles.image} />
      </View>
      <Text style={styles.paragraph}>{message}</Text>

      {errorMessage && (
        <View style={styles.errorSection}>
          <TouchableOpacity
            accessibilityRole="button"
            onPress={setShowErrorMessage}
            activeOpacity={0.5}
          >
            <View style={styles.errorSectionHeader}>
              <Text style={styles.showErrorTrigger}>
                {showErrorMessage
                  ? intl.formatMessage(messages.hideError)
                  : intl.formatMessage(messages.showError)}
              </Text>
              <Image source={showErrorMessage ? chevronLeft : chevronRight} />
            </View>
          </TouchableOpacity>
          {showErrorMessage && (
            <View style={styles.errorSectionView}>
              <View style={styles.errorSectionContent}>
                <Text style={styles.paragraph}>{errorMessage}</Text>
              </View>
            </View>
          )}
        </View>
      )}
      <Button
        block
        onPress={onRequestClose}
        title={intl.formatMessage(globalMessages.close)}
      />
    </ScrollView>
  </Modal>
)

type ExternalProps = {
  visible: boolean,
  title: string,
  message: string,
  errorMessage?: ?string,
  onRequestClose: () => void,
}

export default injectIntl(
  (compose(
    withStateHandlers(
      {
        showErrorMessage: false,
      },
      {
        setShowErrorMessage: (state) => () => ({
          showErrorMessage: !state.showErrorMessage,
        }),
      },
    ),
  )(ErrorModal): ComponentType<ExternalProps>),
)
