import {useTheme} from '@yoroi/theme'
import React from 'react'
import {useIntl} from 'react-intl'
import {ScrollView, StyleSheet, View} from 'react-native'

import {confirmationMessages} from '../../kernel/i18n/global-messages'
import {Button, ButtonType} from '../Button/Button'
import {Space} from '../Space/Space'
import {Spacer} from '../Spacer/Spacer'
import {Text} from '../Text'

type Props = {
  title?: string
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
  const {styles} = useStyles()

  return (
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={{flex: 1, flexDirection: 'column', justifyContent: 'space-between'}}
      keyboardShouldPersistTaps="always"
      testID="twoActionView"
    >
      <View style={styles.content}>
        {title !== undefined && (
          <View style={styles.heading}>
            <Text style={styles.titleText}>{title}</Text>
          </View>
        )}

        {children}
      </View>

      <Spacer fill />

      <View style={styles.buttons}>
        {secondaryButton != null && (
          <Button
            size="S"
            type={ButtonType.Secondary}
            onPress={secondaryButton.onPress}
            title={secondaryButton.label ?? intl.formatMessage(confirmationMessages.commonButtons.cancelButton)}
            disabled={secondaryButton.disabled}
            testID={secondaryButton.testID}
          />
        )}

        <Space width="md" />

        <Button
          size="S"
          onPress={primaryButton.onPress}
          title={primaryButton.label}
          disabled={primaryButton.disabled}
          testID={primaryButton.testID}
        />
      </View>
    </ScrollView>
  )
}

const useStyles = () => {
  const {atoms} = useTheme()

  const styles = StyleSheet.create({
    scrollView: {
      ...atoms.flex_1,
    },
    content: {
      ...atoms.flex_1,
      ...atoms.pb_xl,
    },
    heading: {
      ...atoms.align_center,
      ...atoms.justify_center,
      ...atoms.flex_row,
      ...atoms.pb_lg,
    },
    titleText: {
      fontSize: 20,
      lineHeight: 22,
      fontWeight: 'bold',
    },
    buttons: {
      ...atoms.py_lg,
      ...atoms.flex_row,
    },
  })

  return {styles} as const
}
