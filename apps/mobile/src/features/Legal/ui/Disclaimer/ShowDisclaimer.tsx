import {useNavigation} from '@react-navigation/native'
import {atoms as a, useTheme} from '@yoroi/theme'

import * as React from 'react'
import {View} from 'react-native'
import Markdown from 'react-native-marked'

import {useLanguage} from '~/kernel/i18n/LanguageProvider'
import {useStrings} from '~/kernel/i18n/useStrings'
import {useWalletNavigation} from '~/kernel/navigation/hooks/useWalletNavigation'
import {Button, ButtonType} from '~/ui/Button/Button'
import {Checkbox} from '~/ui/Checkbox/Checkbox'
import {useModal} from '~/ui/Modal/ModalContext'
import {Disclaimer} from '../../common/types'
import {loadText} from './loadText'
import {useDisclaimerState} from './useDisclaimerState'

type Props = {
  type: Disclaimer
  disabled?: boolean
}

export const ShowDisclaimer = ({type, disabled}: Props) => {
  const {languageCode} = useLanguage()
  const {openModal, closeModal} = useModal()
  const strings = useStrings()
  const {resetToTxHistory} = useWalletNavigation()
  const navigation = useNavigation()
  const [showed, setShowed] = React.useState(false)
  const [accepted, setAccepted] = useDisclaimerState(type)
  const {atoms: ta} = useTheme()

  React.useEffect(() => {
    if (!disabled && !accepted && showed === false) {
      openModal({
        title: strings.global.disclaimer,
        content: (
          <View style={[a.px_lg, a.pb_lg]}>
            <Markdown
              value={loadText(type, languageCode)}
              styles={{
                text: {...a.body_1_lg_regular, ...ta.text_gray_max, ...a.py_sm},
                h2: {...a.body_1_lg_medium, ...ta.text_gray_max, ...a.py_sm},
                h1: {
                  ...ta.text_gray_max,
                  ...a.heading_3_medium,
                  ...a.py_sm,
                },
              }}
            />
            <Check text={strings.global.accept} />
          </View>
        ),
        footer: (
          <View style={[a.flex, a.flex_row, a.gap_lg]}>
            <Button
              type={ButtonType.Secondary}
              title={strings.global.cancel}
              onPress={resetToTxHistory}
            />

            <Proceed
              title={strings.global.proceed}
              onPress={() => {
                setAccepted(true)
                closeModal()
              }}
            />
          </View>
        ),
        height: 700,
        canDiscard: false,
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
    ta.text_gray_max,
    resetToTxHistory,
    setAccepted,
    showed,
    strings.global.accept,
    strings.global.cancel,
    strings.global.disclaimer,
    strings.global.proceed,
    type,
  ])
  return null
}

const Check = ({text}: {text: string}) => {
  const {canContinue = false, setCanContinue} = useModal()
  return (
    <Checkbox
      text={text}
      checked={canContinue}
      onChange={() => setCanContinue(!canContinue)}
    />
  )
}

const Proceed = ({title, onPress}: {title: string; onPress: () => void}) => {
  const {canContinue = false} = useModal()

  return <Button title={title} onPress={onPress} disabled={!canContinue} />
}
