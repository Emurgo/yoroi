/* eslint-disable no-alert */
import {IntlShape, MessageDescriptor} from 'react-intl'
import {Alert} from 'react-native'

import {isNative, isWeb} from './constants'
import globalMessages from './i18n/global-messages'

type DialogOptions = {
  title: string
  message: string
  btnYesLabel: string
  btnNoLabel?: string
}
export const DIALOG_BUTTONS = {
  YES: 'Yes',
  NO: 'No',
}
type DialogButton = (typeof DIALOG_BUTTONS)[keyof typeof DIALOG_BUTTONS]

const showDialog = (translations: DialogOptions): Promise<DialogButton> =>
  new Promise((resolve) => {
    const {title, message, btnYesLabel, btnNoLabel} = translations
    const buttons: Array<{text: string; onPress: () => void}> = []

    if (btnNoLabel != null) {
      buttons.push({
        text: btnNoLabel,
        onPress: () => resolve(DIALOG_BUTTONS.NO),
      })
    }

    buttons.push({
      text: btnYesLabel,
      onPress: () => resolve(DIALOG_BUTTONS.YES),
    })

    if (isNative)
      Alert.alert(title, message, buttons, {
        cancelable: false,
      })

    if (isWeb) {
      if (btnNoLabel != null) {
        const result = window.confirm(`${title}\\n\\n${message}`)
        resolve(result ? DIALOG_BUTTONS.YES : DIALOG_BUTTONS.NO)
      } else {
        window.alert(`${title}\\n\\n${message}`)
        resolve(DIALOG_BUTTONS.YES)
      }
    }
  })

export const showErrorDialog = (
  dialog: {
    title: MessageDescriptor
    message: MessageDescriptor
  },
  intl?: IntlShape,
  msgOptions?: {
    message: string
  },
): Promise<DialogButton> => {
  let title, message, yesButton

  if (intl != null) {
    title = intl.formatMessage(dialog.title)
    message = intl.formatMessage(dialog.message, msgOptions)
    yesButton = intl.formatMessage(globalMessages.ok)
  } else {
    title = dialog.title.defaultMessage

    if (
      msgOptions?.message != null &&
      typeof dialog.message.defaultMessage === 'string'
    ) {
      message = dialog.message.defaultMessage?.replace(
        new RegExp('{message}', 'gi'),
        msgOptions.message,
      )
    } else {
      message = 'unknown error'
    }

    yesButton = globalMessages.ok.defaultMessage
  }

  return showDialog({
    title: String(title),
    message,
    btnYesLabel: yesButton,
  })
}

export const showConfirmationDialog = (
  dialog: {
    title: MessageDescriptor
    message: MessageDescriptor
    btnYesLabel: MessageDescriptor
    btnNoLabel?: MessageDescriptor
  },
  intl: IntlShape,
): Promise<DialogButton> =>
  showDialog({
    title: intl.formatMessage(dialog.title),
    message: intl.formatMessage(dialog.message),
    btnYesLabel: intl.formatMessage(dialog.btnYesLabel),
    btnNoLabel: dialog.btnNoLabel
      ? intl.formatMessage(dialog.btnNoLabel)
      : undefined,
  })
