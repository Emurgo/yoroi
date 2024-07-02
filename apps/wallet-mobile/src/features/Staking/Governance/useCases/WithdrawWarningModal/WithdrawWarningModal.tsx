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
  const {atoms} = useTheme()
  const styles = StyleSheet.create({
    root: {
      flex: 1,
      ...atoms.px_lg,
    },
    text: {
      color: '#242838',
      textAlign: 'center',
      fontFamily: 'Rubik-Regular',
      fontSize: 16,
      lineHeight: 24,
      fontWeight: '400',
    },
  })

  return styles
}
