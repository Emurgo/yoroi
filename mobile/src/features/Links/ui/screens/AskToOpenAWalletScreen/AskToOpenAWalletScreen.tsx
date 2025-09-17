import {useLinks} from '@yoroi/links'
import {atoms as a, useTheme} from '@yoroi/theme'

import * as React from 'react'
import {ScrollView, Text, View} from 'react-native'

import {useStrings} from '~/kernel/i18n/useStrings'
import {Button, ButtonType} from '~/ui/Button/Button'

export const AskToOpenWalletScreen = ({
  closeModal,
}: {
  closeModal: () => void
}) => {
  const strings = useStrings()
  const {atoms: ta} = useTheme()
  const {actionFinished} = useLinks()

  const handleOnCancel = () => {
    actionFinished()
    closeModal()
  }

  return (
    <View style={[a.flex_1, ta.bg_color_max]}>
      <ScrollView bounces={false}>
        <Text style={[a.body_2_md_regular, ta.text_gray_max]}>
          {strings.links.askToOpenAWalletDescription}
        </Text>
      </ScrollView>

      <Actions style={[a.flex_row, a.justify_between, a.gap_lg]}>
        <Button
          size="S"
          type={ButtonType.Secondary}
          onPress={handleOnCancel}
          title={strings.global.cancel}
        />

        <Button size="S" onPress={closeModal} title={strings.global.ok} />
      </Actions>
    </View>
  )
}

const Actions = View
