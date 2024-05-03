import {useTheme} from '@yoroi/theme'
import React from 'react'
import {StyleSheet, View} from 'react-native'

import {Button, Spacer, Text} from '../../../../../components'
import {useBlockGoBack} from '../../../../../navigation'
import {useNavigateTo} from '../../../common/navigation'
import {useStrings} from '../../../common/strings'
import {FailedTxImage} from './FailedTxImage'

export const ShowFailedTxScreen = () => {
  useBlockGoBack()
  const strings = useStrings()
  const styles = useStyles()
  const navigateTo = useNavigateTo()

  return (
    <View style={styles.container}>
      <FailedTxImage />

      <Text style={styles.title}>{strings.failedTxTitle}</Text>

      <Text style={styles.text}>{strings.failedTxText}</Text>

      <Spacer height={22} />

      <Button onPress={navigateTo.startSwap} title={strings.failedTxButton} style={styles.button} shelleyTheme />
    </View>
  )
}

const useStyles = () => {
  const {atoms, color} = useTheme()
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      padding: 16,
    },
    title: {
      color: color.gray_cmax,
      ...atoms.heading_3_medium,
      padding: 4,
      textAlign: 'center',
    },
    text: {
      color: color.gray_c600,
      ...atoms.body_2_md_regular,
      textAlign: 'center',
      maxWidth: 330,
    },
    button: {
      paddingHorizontal: 20,
    },
  })

  return styles
}
