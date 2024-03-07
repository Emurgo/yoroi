import {useTheme} from '@yoroi/theme'
import React from 'react'
import {StyleSheet, View} from 'react-native'

import {Button, Spacer, Text} from '../../../../../components'
import {useBlockGoBack, useWalletNavigation} from '../../../../../navigation'
import {useStrings} from '../../../common/strings'
import {SubmittedTxImage} from './SubmittedTxImage'

export const SubmittedTxScreen = () => {
  useBlockGoBack()
  const strings = useStrings()
  const styles = useStyles()
  const {resetToTxHistory} = useWalletNavigation()

  return (
    <View style={styles.container}>
      <SubmittedTxImage />

      <Text style={styles.title}>{strings.submittedTxTitle}</Text>

      <Text style={styles.text}>{strings.submittedTxText}</Text>

      <Spacer height={22} />

      <Button onPress={resetToTxHistory} title={strings.submittedTxButton} style={styles.button} shelleyTheme />
    </View>
  )
}

const useStyles = () => {
  const {theme} = useTheme()
  const {color, typography, padding} = theme
  const styles = StyleSheet.create({
    container: {
      ...padding['l'],
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    title: {
      color: color.gray.max,
      ...typography['heading-3-regular'],
      ...padding['xs'],
      textAlign: 'center',
    },
    text: {
      color: color.gray[600],
      ...typography['body-2-m-regular'],
      textAlign: 'center',
      maxWidth: 300,
    },
    button: {
      ...padding['x-l'],
    },
  })
  return styles
}
