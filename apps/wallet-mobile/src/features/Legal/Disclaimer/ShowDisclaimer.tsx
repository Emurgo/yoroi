import {useNavigation} from '@react-navigation/native'
import {useTheme} from '@yoroi/theme'
import React from 'react'
import {useIntl} from 'react-intl'
import {StyleSheet, View} from 'react-native'
import Markdown from 'react-native-markdown-display'

import {Button, ButtonType} from '../../../components/Button/Button'
import {Checkbox} from '../../../components/Checkbox/Checkbox'
import {useModal} from '../../../components/Modal/ModalContext'
import globalMessages, {actionMessages, confirmationMessages} from '../../../kernel/i18n/global-messages'
import {useLanguage} from '../../../kernel/i18n/LanguageProvider'
import {useWalletNavigation} from '../../../kernel/navigation'
import {loadText} from './loadText'
import {Disclaimer} from './types'
import {useDisclaimerState} from './useDisclaimerState'

type Props = {
  type: Disclaimer
  disabled?: boolean
}

export const ShowDisclaimer = ({type, disabled}: Props) => {
  const {languageCode} = useLanguage()
  const {openModal, closeModal} = useModal()
  const styles = useStyles()
  const strings = useStrings()
  const {resetToTxHistory} = useWalletNavigation()
  const navigation = useNavigation()
  const [showed, setShowed] = React.useState(false)
  const [accepted, setAccepted] = useDisclaimerState(type)

  React.useEffect(() => {
    if (!disabled && !accepted && showed === false) {
      openModal({
        title: strings.disclaimer,
        content: (
          <View style={styles.container}>
            {/* @ts-expect-error old react */}
            <Markdown style={styles}>{loadText(type, languageCode)}</Markdown>

            <Check text={strings.accept} />
          </View>
        ),
        footer: (
          <View style={styles.actions}>
            <Button type={ButtonType.Secondary} title={strings.cancel} onPress={resetToTxHistory} />

            <Proceed
              title={strings.proceed}
              onPress={() => {
                setAccepted(true)
                closeModal()
              }}
            />
          </View>
        ),
        height: 700,
        canDiscard: true,
      })
      setShowed(true)
    }
  }, [
    accepted,
    closeModal,
    disabled,
    languageCode,
    navigation,
    openModal,
    resetToTxHistory,
    setAccepted,
    showed,
    strings.accept,
    strings.cancel,
    strings.disclaimer,
    strings.proceed,
    styles,
    type,
  ])
  return null
}

const Check = ({text}: {text: string}) => {
  const {canContinue = false, setCanContinue} = useModal()
  return <Checkbox text={text} checked={canContinue} onChange={() => setCanContinue(!canContinue)} />
}

const Proceed = ({title, onPress}: {title: string; onPress: () => void}) => {
  const {canContinue = false} = useModal()

  return <Button title={title} onPress={onPress} disabled={!canContinue} />
}

const useStyles = () => {
  const {atoms, color} = useTheme()
  const styles = StyleSheet.create({
    container: {
      ...atoms.px_lg,
      ...atoms.pb_lg,
    },
    // eslint-disable-next-line react-native/no-unused-styles
    body: {
      ...atoms.body_1_lg_regular,
      ...atoms.py_sm,
      color: color.gray_max,
    },
    actions: {
      ...atoms.flex,
      ...atoms.flex_row,
      ...atoms.gap_lg,
    },
  })

  return styles
}
const useStrings = () => {
  const intl = useIntl()

  return {
    disclaimer: intl.formatMessage(globalMessages.disclaimer),
    cancel: intl.formatMessage(globalMessages.cancel),
    proceed: intl.formatMessage(actionMessages.proceed),
    accept: intl.formatMessage(confirmationMessages.commonButtons.iUnderstandButton),
  }
}
