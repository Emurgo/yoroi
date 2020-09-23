// @flow

import React from 'react'
import {View, ScrollView} from 'react-native'
import {injectIntl, intlShape} from 'react-intl'

import {Text, Button, Modal} from '../UiKit'
import {confirmationMessages} from '../../i18n/global-messages'

import styles from './styles/StandardModal.style'

import type {ComponentType} from 'react'

type Props = {
  +intl: intlShape,
  +visible: boolean,
  +title: string,
  +children: React$Node,
  +onRequestClose: () => void,
  +primaryButton: {|
    +label: string,
    +onPress: (void) => PossiblyAsync<void>,
  |},
  +secondaryButton?: {|
    label?: string,
    onPress?: (void) => void,
  |},
  +showCloseIcon?: boolean,
}

const StandardModal = ({
  intl,
  visible,
  title,
  children,
  onRequestClose,
  primaryButton,
  secondaryButton,
  showCloseIcon,
}: Props) => (
  <Modal
    visible={visible}
    onRequestClose={onRequestClose}
    showCloseIcon={showCloseIcon === true}
  >
    <ScrollView style={styles.scrollView}>
      <View style={styles.content}>
        <View style={styles.heading}>
          <Text style={styles.titleText}>{title}</Text>
        </View>
        {children}
      </View>
      <View style={styles.buttons}>
        {secondaryButton != null && (
          <Button
            outlineOnLight
            block
            onPress={secondaryButton.onPress ?? onRequestClose}
            title={
              secondaryButton.label ??
              intl.formatMessage(
                confirmationMessages.commonButtons.cancelButton,
              )
            }
            style={styles.secondaryButton}
          />
        )}
        <Button
          block
          onPress={primaryButton.onPress}
          title={primaryButton.label}
          style={styles.primaryButton}
        />
      </View>
    </ScrollView>
  </Modal>
)

export default (injectIntl(StandardModal): ComponentType<Props>)
