import {atoms as a, useTheme} from '@yoroi/theme'
import * as React from 'react'
import {Linking, ScrollView, Text, View, ViewProps} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'

import {Space} from 'src/ui/Space/Space'
import {Button, ButtonType} from '~/components/Button/Button'
import {useModal} from '~/components/Modal/ModalContext'
import {useStrings} from '~/features/common/useStrings'

export const AskToRedirectScreen = ({link}: {link: string}) => {
  const strings = useStrings()
  const {atoms: ta, palette: p} = useTheme()
  const {closeModal} = useModal()

  const handleOnConfirm = () => {
    closeModal()
    Linking.openURL(link)
  }

  // TODO: revisit check with product size and copy
  return (
    <SafeAreaView
      edges={['bottom', 'left', 'right']}
      style={[a.flex_1, a.px_lg, {backgroundColor: p.bg_color_max}]}
    >
      <ScrollView bounces={false}>
        <Text style={[a.body_2_md_regular, {color: p.gray_max}]}>
          {strings.askToRedirectDescription}
        </Text>

        <Space fill />
      </ScrollView>

      <Actions style={[a.flex_row, a.justify_between]}>
        <Button
          size="S"
          type={ButtonType.Secondary}
          onPress={closeModal}
          title={strings.cancel}
        />

        <Space width={16} />

        <Button size="S" onPress={handleOnConfirm} title={strings.ok} />
      </Actions>
    </SafeAreaView>
  )
}

const Actions = (props: ViewProps) => <View {...props} />
