import {useTheme} from '@yoroi/theme'
import React from 'react'
import {StyleSheet, View} from 'react-native'

import {Button} from '../../../../../components/Button/Button'
import {Spacer} from '../../../../../components/Spacer/Spacer'
import {Text} from '../../../../../components/Text'
import {useStrings} from '../../common/strings'

type Props = {
  onParticipatePress: () => void
}

export const WithdrawWarningModal = ({onParticipatePress}: Props) => {
  const strings = useStrings()
  const styles = useStyles()

  return (
    <View style={styles.root}>
      <Spacer height={48} />

      <Text style={styles.text}>{strings.withdrawWarningDescription}</Text>

      <Spacer fill />

      <Button title={strings.withdrawWarningButton} onPress={onParticipatePress} />

      <Spacer height={24} />
    </View>
  )
}

const useStyles = () => {
  const {atoms, color} = useTheme()
  const styles = StyleSheet.create({
    root: {
      ...atoms.flex_1,
      ...atoms.px_lg,
    },
    text: {
      color: color.text_gray_medium,
      ...atoms.body_1_lg_regular,
      ...atoms.text_center,
      ...atoms.font_normal,
    },
  })

  return styles
}
