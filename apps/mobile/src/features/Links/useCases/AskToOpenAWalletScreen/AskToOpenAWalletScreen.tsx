import {useLinks} from '@yoroi/links'
import {atoms as a, useTheme} from '@yoroi/theme'
import * as React from 'react'
import {ScrollView, Text, View, ViewProps} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'

import {Button, ButtonType} from '~/ui/Button/Button'
import {useModal} from '~/ui/Modal/ModalContext'
import {Space} from '~/ui/Space/Space'
import {useStrings} from '~/kernel/i18n/useStrings'

export const AskToOpenWalletScreen = () => {
  const strings = useStrings()
  const {atoms: ta, palette: p} = useTheme()
  const {closeModal} = useModal()
  const {actionFinished} = useLinks()

  const handleOnCancel = () => {
    actionFinished()
    closeModal()
  }

  // TODO: revisit check with product size and copy
  return (
    <SafeAreaView
      edges={['bottom', 'left', 'right']}
      style={[a.flex_1, a.px_lg, {backgroundColor: p.bg_color_max}]}
    >
      <ScrollView bounces={false}>
        <Text style={[a.body_2_md_regular, {color: p.gray_max}]}>
          {strings.links.askToOpenAWalletDescription}
        </Text>

        <Space.Height._2xs fill />
      </ScrollView>

      <Actions style={[a.flex_row, a.justify_between]}>
        <Button
          size="S"
          type={ButtonType.Secondary}
          onPress={handleOnCancel}
          title={strings.links.cancel}
        />

        <Space.Width.md />

        <Button size="S" onPress={closeModal} title={strings.links.ok} />
      </Actions>
    </SafeAreaView>
  )
}

const Actions = (props: ViewProps) => <View {...props} />
