import {useTheme} from '@yoroi/theme'
import React from 'react'
import {useIntl} from 'react-intl'
import {ScrollView, StyleSheet, View} from 'react-native'

import {Icon} from '../../components/Icon'
import globalMessages, {confirmationMessages} from '../../i18n/global-messages'
import {Modal} from '../../legacy/Modal'
import {Button, Checkbox, Spacer, Text} from '..'

type DangerousActionProps = {
  title: string
  children: React.ReactNode
  alertBox?: {
    title?: string
    content: Array<string>
  }
  primaryButton: {
    disabled?: boolean
    label: string
    onPress: () => Promise<void> | void
    testID?: string
  }
  secondaryButton?: {
    disabled?: boolean
    label?: string
    onPress: () => Promise<void> | void
    primary?: boolean
    testID?: string
  }
  checkboxLabel?: string
}

export const DangerousAction = ({
  title,
  children,
  alertBox,
  primaryButton,
  secondaryButton,
  checkboxLabel,
}: DangerousActionProps) => {
  const styles = useStyles()
  const [isChecked, setIsChecked] = React.useState(false)
  const intl = useIntl()

  return (
    <ScrollView bounces={false} testID="dangerousActionView">
      <View style={styles.header}>
        <Text style={styles.heading}>{title}</Text>
      </View>

      <Spacer height={24} />

      {children}

      <Spacer height={24} />

      {alertBox && (
        <>
          <AlertBox title={alertBox.title} content={alertBox.content} />

          <Spacer height={24} />
        </>
      )}

      <Checkbox
        onChange={() => setIsChecked(!isChecked)}
        checked={isChecked}
        text={checkboxLabel ?? intl.formatMessage(confirmationMessages.commonButtons.iUnderstandButton)}
        style={styles.checkbox}
        testID="dangerousActionCheckbox"
      />

      <Spacer height={24} />

      <View style={styles.actions}>
        <Button
          block
          onPress={primaryButton.onPress}
          title={primaryButton.label}
          disabled={primaryButton.disabled}
          style={styles.primaryButton}
          testID={primaryButton.testID}
        />

        <Spacer height={16} />

        {secondaryButton ? (
          <Button
            block
            disabled={!isChecked}
            onPress={secondaryButton.onPress}
            title={secondaryButton.label ?? intl.formatMessage(confirmationMessages.commonButtons.cancelButton)}
            style={styles.secondaryButton}
            testID={secondaryButton.testID}
          />
        ) : null}
      </View>
    </ScrollView>
  )
}

type Props = {
  visible: boolean
  onRequestClose: () => void
  showCloseIcon: boolean
  title: string
  children: React.ReactNode
  alertBox?: {
    title?: string
    content: Array<string>
  }
  primaryButton: {
    label: string
    onPress: () => Promise<void> | void
  }
  secondaryButton?: {
    label?: string
    onPress: () => Promise<void> | void
    primary?: boolean
  }
  checkboxLabel?: string
}

export const DangerousActionModal = ({
  visible,
  onRequestClose,
  showCloseIcon,
  title,
  children,
  alertBox,
  primaryButton,
  secondaryButton,
  checkboxLabel,
}: Props) => (
  <Modal visible={visible} onRequestClose={onRequestClose} showCloseIcon={showCloseIcon}>
    <DangerousAction
      title={title}
      alertBox={alertBox}
      primaryButton={primaryButton}
      secondaryButton={secondaryButton}
      checkboxLabel={checkboxLabel}
    >
      {children}
    </DangerousAction>
  </Modal>
)

const AlertBox = ({title, content}: {title?: string; content: string[]}) => {
  const intl = useIntl()
  const {alertStyles, colors} = useAlertStyles()
  return (
    <View style={alertStyles.container}>
      <View style={alertStyles.header}>
        <Icon.Info size={26} color={colors.iconColor} />

        <Spacer width={8} />

        <Text style={[alertStyles.title]}>
          {title != null ? title : intl.formatMessage(globalMessages.attention).toUpperCase()}
        </Text>
      </View>

      <Spacer height={8} />

      {content.map((line, i) => (
        <View key={line}>
          <Text style={[alertStyles.paragraph, alertStyles.text]}>{line}</Text>

          {i < content.length - 1 && <Spacer height={16} /> /* no spacer after last line */}
        </View>
      ))}
    </View>
  )
}

const useStyles = () => {
  const {theme} = useTheme()
  const {color, typography} = theme
  const styles = StyleSheet.create({
    header: {
      alignItems: 'center',
    },
    heading: {
      ...typography['body-3-s-medium'],
    },
    checkbox: {
      paddingLeft: 4,
    },
    actions: {},
    primaryButton: {},
    secondaryButton: {
      backgroundColor: color.magenta[500],
    },
  })
  return styles
}

const useAlertStyles = () => {
  const {theme} = useTheme()
  const {color, typography} = theme
  const alertStyles = StyleSheet.create({
    container: {
      backgroundColor: color.magenta[500],
      borderRadius: 8,
      padding: 16,
    },
    header: {
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
      paddingRight: 16,
    },
    title: {
      color: color.magenta[500],
      ...typography['body-3-s-medium'],
    },
    paragraph: {
      ...typography['body-2-m-regular'],
    },
    text: {
      color: color.gray[900],
    },
  })
  const colors = {
    iconColor: color.magenta[500],
  }
  return {alertStyles, colors}
}
