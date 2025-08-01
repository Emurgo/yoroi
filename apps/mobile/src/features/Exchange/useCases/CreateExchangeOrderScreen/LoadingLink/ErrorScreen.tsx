import {atoms as a, useTheme} from '@yoroi/theme'
import * as React from 'react'
import {Text, View} from 'react-native'

import {ErrorLogo} from '~/features/Exchange/illustrations/ErrorLogo'
import {useStrings} from '~/kernel/i18n/useStrings'
import {Button} from '~/ui/Button/Button'
import {useModal} from '~/ui/Modal/ModalContext'
import {Space} from '~/ui/Space/Space'

export const ErrorScreen = () => {
  const strings = useStrings()
  const {closeModal} = useModal()
  const {atoms: ta} = useTheme()

  return (
    <View style={[a.flex_1, a.align_center, a.justify_center]}>
      <ErrorLogo />

      <Space.Height.lg />

      <Text
        style={[
          a.heading_3_medium,
          a.text_center,
          ta.text_gray_max,
          {maxWidth: 340},
        ]}
      >
        {strings.linkError}
      </Text>

      <Space.Height.lg />

      <Button
        testID="rampOnOffErrorCloseButton"
        title={strings.close}
        style={a.px_lg}
        onPress={closeModal}
      />
    </View>
  )
}
