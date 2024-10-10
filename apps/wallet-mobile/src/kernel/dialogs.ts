/* eslint-disable @typescript-eslint/no-explicit-any */
import 'react-intl'

import type {IntlShape} from 'react-intl'
import {Alert} from 'react-native'

import globalMessages from './i18n/global-messages'

type DialogOptions = {
  title: string
  message: string
  yesButton: string
  noButton?: string
}
export const DIALOG_BUTTONS = {
  YES: 'Yes',
  NO: 'No',
}
type DialogButton = (typeof DIALOG_BUTTONS)[keyof typeof DIALOG_BUTTONS]

const showDialog = (translations: DialogOptions): Promise<DialogButton> =>
  new Promise((resolve) => {
    const {title, message, yesButton, noButton} = translations
    const buttons: Array<any> = []

    if (noButton != null) {
      buttons.push({
        text: noButton,
        onPress: () => resolve(DIALOG_BUTTONS.NO),
      })
    }

    buttons.push({
      text: yesButton,
      onPress: () => resolve(DIALOG_BUTTONS.YES),
    })
    Alert.alert(title, message, buttons, {
      cancelable: false,
    })
  })

export const showErrorDialog = (
  dialog: {
    title: Record<string, any>
    message: Record<string, any>
  },
  intl: IntlShape | null | undefined,
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
    // in this case the function was called without providing the IntlShape
    // object, so only an english dialog will be displayed
    title = dialog.title.defaultMessage

    // seems impossible to pass eslint check using a ternary operator here
    if (msgOptions != null && 'message' in msgOptions) {
      message = dialog.message.defaultMessage.replace(new RegExp('{message}', 'gi'), msgOptions.message)
    } else {
      message = 'unknown error'
    }

    yesButton = globalMessages.ok.defaultMessage
  }

  return showDialog({
    title,
    message,
    yesButton,
  })
}

export const showConfirmationDialog = (dialog: any | DialogOptions, intl: IntlShape): Promise<DialogButton> =>
  showDialog({
    title: intl.formatMessage(dialog.title),
    message: intl.formatMessage(dialog.message),
    yesButton: intl.formatMessage(dialog.yesButton),
    noButton: intl.formatMessage(dialog.noButton),
  })
