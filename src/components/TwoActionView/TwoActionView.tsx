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
    label: string
    onPress: () => Promise<void> | void
  }
  secondaryButton?: {
    label?: string
    onPress: () => void
  }
}

export const TwoActionView = ({title, children, primaryButton, secondaryButton}: Props) => {
  const intl = useIntl()

  return (
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
