// @flow

import React from 'react'
import {Text, View, Image, TouchableOpacity, ScrollView} from 'react-native'
import {injectIntl, defineMessages, type IntlShape} from 'react-intl'
import {compose} from 'redux'
import {withStateHandlers} from 'recompose'

import {Modal, Button} from '../UiKit'
import globalMessages, {errorMessages} from '../../i18n/global-messages'
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

type Props = {
  title?: string,
  errorMessage: string,
  errorLogs?: ?string,
  onDismiss: () => void,
  intl: IntlShape,
}

const _ErrorView = ({
  intl,
  title,
  errorMessage,
  errorLogs,
  onDismiss,
  showErrorLogs,
  setShowErrorLogs,
}: {intl: IntlShape} & Object) => (
  <ScrollView style={styles.scrollView}>
    <View style={styles.headerView}>
      <Text style={styles.title}>
        {title ??
          intl.formatMessage(errorMessages.generalLocalizableError.title)}
      </Text>
      <Image source={image} style={styles.image} />
    </View>
    <Text style={styles.paragraph}>{errorMessage}</Text>

    {errorLogs != null && (
      <View style={styles.errorSection}>
        <TouchableOpacity
          accessibilityRole="button"
          onPress={setShowErrorLogs}
          activeOpacity={0.5}
        >
          <View style={styles.errorSectionHeader}>
            <Text style={styles.showErrorTrigger}>
              {showErrorLogs
                ? intl.formatMessage(messages.hideError)
                : intl.formatMessage(messages.showError)}
            </Text>
            <Image source={showErrorLogs ? chevronLeft : chevronRight} />
          </View>
        </TouchableOpacity>
        {showErrorLogs && (
          <View style={styles.errorSectionView}>
            <View style={styles.errorSectionContent}>
              <Text style={styles.paragraph}>{errorLogs}</Text>
            </View>
          </View>
        )}
      </View>
    )}
    <Button
      block
      onPress={onDismiss}
      title={intl.formatMessage(globalMessages.close)}
    />
  </ScrollView>
)

export const ErrorView = injectIntl(
  (compose(
    withStateHandlers(
      {
        showErrorLogs: false,
      },
      {
        setShowErrorLogs: (state) => () => ({
          showErrorLogs: !state.showErrorLogs,
        }),
      },
    ),
  )(_ErrorView): ComponentType<Props>),
)

const ErrorModal = ({
  visible,
  title,
  errorMessage,
  errorLogs,
  onRequestClose,
}) => (
  <Modal visible={visible} onRequestClose={onRequestClose} showCloseIcon>
    <ErrorView
      title={title}
      errorMessage={errorMessage}
      errorLogs={errorLogs}
      onDismiss={onRequestClose}
    />
  </Modal>
)

type ExternalProps = {
  visible: boolean,
  title?: string,
  errorMessage: string,
  errorLogs?: ?string,
  onRequestClose: () => void,
}

export default (ErrorModal: ComponentType<ExternalProps>)
