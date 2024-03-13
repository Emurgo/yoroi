import {useTheme} from '@yoroi/theme'
import React from 'react'
import {defineMessages, useIntl} from 'react-intl'
import {Image, LayoutAnimation, ScrollView, StyleSheet, Text, TouchableOpacity, View} from 'react-native'

import image from '../../assets/img/error.png'
import globalMessages, {errorMessages} from '../../i18n/global-messages'
import {Modal} from '../../legacy/Modal'
import {isEmptyString} from '../../utils/utils'
import {Button} from '../Button'
import {Icon} from '../Icon'

type ErrorViewProps = {
  title?: string
  errorMessage: string
  errorLogs: string | undefined | null
  onDismiss: () => void
}

export const ErrorView = ({title, errorMessage, errorLogs, onDismiss}: ErrorViewProps) => {
  const intl = useIntl()
  const {styles, colors} = useStyles()
  const [showErrorLogs, setShowErrorLogs] = React.useState(false)
  const toggleShowErrorlogs = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)
    setShowErrorLogs(!showErrorLogs)
  }

  return (
    <ScrollView style={styles.scrollView} testID="errorView">
      <View style={styles.headerView}>
        <Text style={styles.title}>{title ?? intl.formatMessage(errorMessages.generalLocalizableError.title)}</Text>

        <Image source={image} style={styles.image} />
      </View>

      <Text style={styles.paragraph}>{errorMessage}</Text>

      {!isEmptyString(errorLogs) && (
        <View style={styles.errorSection}>
          <TouchableOpacity
            accessibilityRole="button"
            onPress={toggleShowErrorlogs}
            activeOpacity={0.5}
            testID="showErrorLogsButton"
          >
            <View style={styles.errorSectionHeader}>
              <Text style={styles.showErrorTrigger}>
                {showErrorLogs ? intl.formatMessage(messages.hideError) : intl.formatMessage(messages.showError)}
              </Text>

              <Icon.Chevron size={28} color={colors.iconColor} direction={showErrorLogs ? 'left' : 'right'} />
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
        testID="closeErrorModalButton"
      />
    </ScrollView>
  )
}

type Props = {
  visible: boolean
  title?: string
  errorMessage: string
  errorLogs: string | null
  onRequestClose: () => void
}

export const ErrorModal = ({visible, title, errorMessage, errorLogs, onRequestClose}: Props) => (
  <Modal visible={visible} onRequestClose={onRequestClose}>
    <ErrorView title={title} errorMessage={errorMessage} errorLogs={errorLogs} onDismiss={onRequestClose} />
  </Modal>
)

const useStyles = () => {
  const {theme} = useTheme()
  const {color, typography, padding} = theme
  const text = {
    color: color.gray.max,
    ...typography['body-2-m-regular'],
  }
  const styles = StyleSheet.create({
    scrollView: {
      ...padding['r-s'],
    },
    headerView: {
      alignItems: 'center',
    },
    title: {
      ...text,
      ...padding['b-l'],
    },
    image: {
      ...padding['b-l'],
    },
    paragraph: {
      ...text,
      ...padding['b-l'],
      ...typography['body-2-m-regular'],
    },
    errorSection: {
      marginVertical: 16,
    },
    errorSectionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 5,
    },
    showErrorTrigger: {
      flex: 1,
      ...text,
      color: color.gray[700],
    },
    errorSectionView: {
      elevation: 1,
      shadowOffset: {width: 0, height: 2},
      shadowRadius: 12,
      shadowOpacity: 0.06,
      shadowColor: color['black-static'],
      backgroundColor: color.gray.min,
      borderRadius: 8,
    },
    errorSectionContent: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      ...padding['m'],
    },
  })
  const colors = {
    iconColor: color.gray[400],
  }
  return {styles, colors}
}

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
