import React from 'react'
import {useIntl} from 'react-intl'
import {ScrollView, StyleSheet, View} from 'react-native'

import {confirmationMessages} from '../../i18n/global-messages'
import {spacing} from '../../theme'
import {Button} from '../Button'
import {Text} from '../Text'

type Props = {
  title: string
  children: React.ReactNode
  primaryButton: {
    disabled?: boolean
    label: string
    onPress: () => Promise<void> | void
    testID?: string
  }
  secondaryButton?: {
    disabled?: boolean
    label?: string
    onPress: () => void
    testID?: string
  }
}

export const TwoActionView = ({title, children, primaryButton, secondaryButton}: Props) => {
  const intl = useIntl()

  return (
    <ScrollView style={styles.scrollView} keyboardShouldPersistTaps="always" testID="twoActionView">
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
            disabled={secondaryButton.disabled}
            style={styles.secondaryButton}
            testID={secondaryButton.testID}
          />
        )}

        <Button
          block
          onPress={primaryButton.onPress}
          title={primaryButton.label}
          disabled={primaryButton.disabled}
          style={styles.primaryButton}
          testID={primaryButton.testID}
        />
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  scrollView: {
    paddingRight: 10,
  },
  content: {
    flex: 1,
    marginBottom: 24,
  },
  heading: {
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    marginBottom: spacing.paragraphBottomMargin,
  },
  titleText: {
    fontSize: 20,
    lineHeight: 22,
    fontWeight: 'bold',
  },
  buttons: {
    flexDirection: 'row',
    marginTop: 12,
  },
  primaryButton: {},
  secondaryButton: {
    marginRight: 12,
  },
})
