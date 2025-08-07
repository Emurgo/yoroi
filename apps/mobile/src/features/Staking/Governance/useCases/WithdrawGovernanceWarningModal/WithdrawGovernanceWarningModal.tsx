import {atoms as a, useTheme} from '@yoroi/theme'
import * as React from 'react'
import {Text, View} from 'react-native'

import {useStrings} from '~/kernel/i18n/useStrings'
import {Button} from '~/ui/Button/Button'
import {Space} from '~/ui/Space/Space'

type Props = {
  onParticipatePress: () => void
}

export const WithdrawGovernanceWarningModal = ({onParticipatePress}: Props) => {
  const strings = useStrings()
  const {atoms: ta} = useTheme()

  return (
    <View style={[a.flex_1, a.px_lg]}>
      <Space.Height.lg />

      <Text
        style={[
          a.body_1_lg_regular,
          a.text_center,
          a.font_normal,
          ta.text_gray_medium,
        ]}
      >
        {strings.withdrawWarningDescription}
      </Text>

      <Space.Height.sm fill />

      <Button
        title={strings.withdrawWarningButton}
        onPress={onParticipatePress}
      />

      <Space.Height.lg />
    </View>
  )
}
