import {useTheme} from '@yoroi/theme'
import React from 'react'
import {StyleSheet} from 'react-native'

import {Button} from '../../../../../../../components/Button/Button'
import {SafeArea} from '../../../../../../../components/SafeArea'
import {Spacer} from '../../../../../../../components/Spacer/Spacer'
import {Text} from '../../../../../../../components/Text'
import {useBlockGoBack, useWalletNavigation} from '../../../../../../../kernel/navigation'
import {useStrings} from '../../../../../../Send/common/strings'
import {SubmittedTxImage} from './SubmittedTxImage'

export const SubmittedTxScreen = () => {
  useBlockGoBack()
  const strings = useStrings()
  const styles = useStyles()
  const {resetToTxHistory} = useWalletNavigation()

  return (
    <SafeArea style={styles.container}>
      <SubmittedTxImage />

      <Text style={styles.title}>{strings.submittedTxTitle}</Text>

      <Text style={styles.text}>{strings.submittedTxText}</Text>

      <Spacer height={22} />

      <Button onPress={resetToTxHistory} title={strings.submittedTxButton} style={styles.button} />
    </SafeArea>
  )
}

const useStyles = () => {
  const {color, atoms} = useTheme()
  const styles = StyleSheet.create({
    container: {
      backgroundColor: color.bg_color_max,
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      padding: 16,
    },
    title: {
      color: color.gray_max,
      ...atoms.heading_3_medium,
      padding: 4,
      textAlign: 'center',
    },
    text: {
      color: color.gray_600,
      ...atoms.body_2_md_regular,
      textAlign: 'center',
      maxWidth: 300,
    },
    button: {
      paddingHorizontal: 20,
    },
  })

  return styles
}
