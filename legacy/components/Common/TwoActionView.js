// @flow

import React from 'react'
import {type IntlShape, injectIntl} from 'react-intl'
import {ScrollView, View} from 'react-native'
import {type PressEvent} from 'react-native/Libraries/Types/CoreEventTypes'

import {confirmationMessages} from '../../i18n/global-messages'
import {Button, Text} from '../UiKit'
import styles from './styles/TwoActionView.style'

type Props = {|
  +intl: IntlShape,
  +title: string,
  +children: React$Node,
  +primaryButton: {|
    +label: string,
    +onPress: (event: PressEvent) => PossiblyAsync<void>,
  |},
  +secondaryButton?: {|
    label?: string,
    onPress: (event: PressEvent) => void,
  |},
|}

const TwoActionView = ({intl, title, children, primaryButton, secondaryButton}: Props) => (
  <ScrollView style={styles.scrollView} keyboardShouldPersistTaps={'always'}>
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
          onPress={secondaryButton.onPress}
          title={secondaryButton.label ?? intl.formatMessage(confirmationMessages.commonButtons.cancelButton)}
          style={styles.secondaryButton}
        />
      )}
      <Button block onPress={primaryButton.onPress} title={primaryButton.label} style={styles.primaryButton} />
    </View>
  </ScrollView>
)

export default injectIntl(TwoActionView)
