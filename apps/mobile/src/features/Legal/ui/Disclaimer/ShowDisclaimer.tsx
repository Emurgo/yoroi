import {useNavigation} from '@react-navigation/native'
import {atoms as a, useTheme} from '@yoroi/theme'

import * as React from 'react'
import {ScrollView, View} from 'react-native'
import Markdown from 'react-native-marked'
import {SafeAreaView} from 'react-native-safe-area-context'

import {useLanguage} from '~/kernel/i18n/LanguageProvider'
import {LanguageCode} from '~/kernel/i18n/localization'
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
  const [canContinue, setCanContinue] = React.useState(false)
  const {atoms: ta, palette: p} = useTheme()

  React.useEffect(() => {
    if (!disabled && !accepted && showed === false) {
      openModal({
        title: strings.global.disclaimer,
        content: (
          <DisclaimerContent
            type={type}
            languageCode={languageCode}
            onCanContinueChange={setCanContinue}
          />
        ),
        footer: (
          <View style={[a.flex, a.flex_row, a.gap_lg, a.px_lg, a.pb_lg]}>
            <Button
              type={ButtonType.Secondary}
              title={strings.global.cancel}
              onPress={resetToTxHistory}
            />

            <Button
              title={strings.global.proceed}
              onPress={() => {
                setAccepted(true)
                closeModal()
              }}
              disabled={!canContinue}
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
    ta.text_gray_max,
    resetToTxHistory,
    setAccepted,
    showed,
    strings.global.accept,
    strings.global.cancel,
    strings.global.disclaimer,
    strings.global.proceed,
    type,
    canContinue,
  ])
  return null
}

const DisclaimerContent = ({
  type,
  languageCode,
  onCanContinueChange,
}: {
  type: Disclaimer
  languageCode: LanguageCode
  onCanContinueChange: (canContinue: boolean) => void
}) => {
  const {atoms: ta, palette: p} = useTheme()
  const strings = useStrings()
  const [canContinue, setCanContinue] = React.useState(false)

  const handleCheckboxChange = (checked: boolean) => {
    setCanContinue(checked)
    onCanContinueChange(checked)
  }

  return (
    <SafeAreaView
      edges={['bottom', 'left', 'right']}
      style={[a.flex_1, {backgroundColor: p.bg_color_max}]}
    >
      <ScrollView
        style={[a.flex_1, a.px_lg]}
        bounces={false}
        showsVerticalScrollIndicator={true}
      >
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

        <View style={[a.pt_lg, a.pb_xl]}>
          <Checkbox
            text={strings.global.accept}
            checked={canContinue}
            onChange={handleCheckboxChange}
            testID="disclaimer-checkbox"
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}
