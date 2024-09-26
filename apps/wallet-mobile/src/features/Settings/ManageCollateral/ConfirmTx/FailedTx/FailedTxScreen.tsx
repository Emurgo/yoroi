import {useNavigation} from '@react-navigation/native'
import {useTheme} from '@yoroi/theme'
import React from 'react'
import {StyleSheet} from 'react-native'

import {Button} from '../../../../../components/Button/NewButton'
import {SafeArea} from '../../../../../components/SafeArea'
import {Spacer} from '../../../../../components/Spacer/Spacer'
import {Text} from '../../../../../components/Text'
import {useStrings} from '../../../../Send/common/strings'
import {FailedTxImage} from './FailedTxImage'

export const FailedTxScreen = () => {
  const strings = useStrings()
  const styles = useStyles()
  const navigation = useNavigation()

  return (
    <SafeArea style={styles.container}>
      <FailedTxImage />

      <Text style={styles.title}>{strings.failedTxTitle}</Text>

      <Text style={styles.text}>{strings.failedTxText}</Text>

      <Spacer height={22} />

      <Button onPress={navigation.goBack} title={strings.failedTxButton} style={styles.button} />
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
      ...atoms.p_lg,
    },
    title: {
      color: color.gray_max,
      ...atoms.heading_3_medium,
      ...atoms.p_xs,
      textAlign: 'center',
    },
    text: {
      color: color.gray_600,
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
