import {useTheme} from '@yoroi/theme'
import React from 'react'
import {StyleSheet, View} from 'react-native'

import {Button, Spacer, Text} from '../../../../../components'
import {useStrings} from '../../common'

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

      <Button title={strings.withdrawWarningButton} shelleyTheme onPress={onParticipatePress} />

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
      color: color.gray_c900,
      textAlign: 'center',
      fontFamily: 'Rubik-Regular',
      fontSize: 16,
      lineHeight: 24,
      ...atoms.font_normal,
    },
  })

  return styles
}
