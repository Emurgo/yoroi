import {atoms as a, useTheme} from '@yoroi/theme'

import {useQuery} from '@tanstack/react-query'
import * as React from 'react'
import {View} from 'react-native'
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

const useDisclaimerText = ({
  type,
  languageCode,
}: {
  type: Disclaimer
  languageCode: LanguageCode
}) => {
  const query = useQuery({
    queryKey: ['useDisclaimerText', type, languageCode],
    queryFn: () => loadText(type, languageCode),
  })

  return query
}

export const ShowDisclaimer = ({type, disabled}: Props) => {
  const {languageCode} = useLanguage()
  const {openModal, closeModal} = useModal()
  const strings = useStrings()
  const {resetToTxHistory} = useWalletNavigation()
  const [showed, setShowed] = React.useState(false)
  const [accepted, setAccepted] = useDisclaimerState(type)
  const {atoms: ta, palette: p} = useTheme()
  const {data: disclaimerText, isLoading} = useDisclaimerText({
    type,
    languageCode,
  })

  React.useEffect(() => {
    if (
      !disabled &&
      !accepted &&
      showed === false &&
      !isLoading &&
      disclaimerText
    ) {
      openModal({
        title: strings.global.disclaimer,
        content: (
          <SafeAreaView
            edges={['bottom', 'left', 'right']}
            style={[a.flex_1, ta.bg_color_max]}
          >
            <View style={[a.flex_1, a.px_lg]}>
              <View style={{height: 400}}>
                <Markdown
                  value={disclaimerText || ''}
                  flatListProps={{
                    style: {
                      backgroundColor: p.bg_color_max,
                    },
                  }}
                  styles={{
                    text: {
                      ...a.body_1_lg_regular,
                      ...ta.text_gray_max,
                      ...a.py_sm,
                    },
                    h2: {
                      ...a.body_1_lg_medium,
                      ...ta.text_gray_max,
                      ...a.py_sm,
                    },
                    h1: {
                      ...ta.text_gray_max,
                      ...a.heading_3_medium,
                      ...a.py_sm,
                    },
                  }}
                />
              </View>

              <View style={[a.py_lg]}>
                <Check text={strings.global.accept} />
              </View>
            </View>
          </SafeAreaView>
        ),
        footer: (
          <View style={[a.flex, a.flex_row, a.gap_lg, a.px_lg, a.pb_lg]}>
            <Button
              type={ButtonType.Secondary}
              title={strings.global.cancel}
              onPress={() => {
                resetToTxHistory()
                closeModal()
              }}
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    disabled,
    accepted,
    showed,
    isLoading,
    disclaimerText,
    openModal,
    setShowed,
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
