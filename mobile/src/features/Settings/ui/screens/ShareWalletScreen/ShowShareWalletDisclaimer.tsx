import {atoms as a, useTheme} from '@yoroi/theme'

import {useNavigation} from '@react-navigation/native'
import {useQuery} from '@tanstack/react-query'
import * as React from 'react'
import {View} from 'react-native'
import Markdown from 'react-native-marked'

import {Disclaimer} from '~/features/Legal/common/types'
import {loadText} from '~/features/Legal/ui/shared/Disclaimer/loadText'
import {useLanguage} from '~/kernel/i18n/LanguageProvider'
import {LanguageCode} from '~/kernel/i18n/localization'
import {useStrings} from '~/kernel/i18n/useStrings'
import {Button, ButtonType} from '~/ui/Button/Button'
import {Checkbox} from '~/ui/Checkbox/Checkbox'
import {useModal} from '~/ui/Modal/context/ModalContext'
import {Modal} from '~/ui/Modal/ui/screens/Modal/Modal'

type Props = {
  onAccepted: () => void
  disabled?: boolean
}

const useDisclaimerText = ({languageCode}: {languageCode: LanguageCode}) => {
  const query = useQuery({
    queryKey: ['useShareWalletDisclaimerText', languageCode],
    queryFn: () => loadText(Disclaimer.ShareWallet, languageCode),
  })

  return query
}

export const ShowShareWalletDisclaimer = ({onAccepted, disabled}: Props) => {
  const {languageCode} = useLanguage()
  const {openModal, closeModal} = useModal()
  const strings = useStrings()
  const navigation = useNavigation()
  const [showed, setShowed] = React.useState(false)
  const {atoms: ta, palette: p, basePalette} = useTheme()
  const {data: disclaimerText, isLoading} = useDisclaimerText({
    languageCode,
  })

  const openDisclaimerModal = React.useCallback(() => {
    if (!disclaimerText) return
    openModal({
      title: strings.global.disclaimer,
      content: (
        <Modal.Content>
          <Markdown
            colorScheme={basePalette}
            backgroundColor={ta.bg_color_max.backgroundColor}
            value={disclaimerText || ''}
            flatListProps={{
              scrollEnabled: false,
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
        </Modal.Content>
      ),
      footer: (
        <Modal.Footer>
          <View style={[a.py_lg]}>
            <Check text={strings.global.accept} />
          </View>

          <View style={[a.flex_row, a.gap_sm]}>
            <Button
              type={ButtonType.Secondary}
              title={strings.global.cancel}
              onPress={() => {
                navigation.goBack()
                closeModal()
              }}
            />
            <Proceed
              title={strings.global.proceed}
              onPress={() => {
                onAccepted()
                closeModal()
              }}
            />
          </View>
        </Modal.Footer>
      ),
      height: 500,
      withFeedback: true,
      canDiscard: false,
    })
    setShowed(true)
  }, [
    disclaimerText,
    openModal,
    strings.global.disclaimer,
    strings.global.accept,
    strings.global.cancel,
    strings.global.proceed,
    basePalette,
    ta,
    p.bg_color_max,
    navigation,
    closeModal,
    onAccepted,
  ])

  React.useEffect(() => {
    if (!disabled && showed === false && !isLoading && disclaimerText) {
      openDisclaimerModal()
    }
  }, [disabled, showed, isLoading, disclaimerText, openDisclaimerModal])

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
