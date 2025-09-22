import {atoms as a, useTheme} from '@yoroi/theme'

import * as Linking from 'expo-linking'
import * as React from 'react'
import {ScrollView, Text, View} from 'react-native'

import {useStrings} from '~/kernel/i18n/useStrings'
import {Button, ButtonType} from '~/ui/Button/Button'
import {useModal} from '~/ui/Modal/ModalContext'

export const AskToRedirectScreen = ({link}: {link: string}) => {
  const strings = useStrings()
  const {atoms: ta} = useTheme()
  const {closeModal} = useModal()

  const handleOnConfirm = () => {
    closeModal()
    Linking.openURL(link)
  }

  return (
    <View style={[a.flex_1, ta.bg_color_max, a.gap_lg]}>
      <ScrollView bounces={false} contentContainerStyle={a.gap_lg}>
        <Text style={[a.body_2_md_regular, ta.text_gray_max]}>
          {strings.links.askToRedirectDescription}
        </Text>
      </ScrollView>

      <Actions style={[a.flex_row, a.justify_between, a.gap_lg]}>
        <Button
          size="S"
          type={ButtonType.Secondary}
          onPress={closeModal}
          title={strings.global.cancel}
        />

        <Button size="S" onPress={handleOnConfirm} title={strings.global.ok} />
      </Actions>
    </View>
  )
}

const Actions = View
