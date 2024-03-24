import {useTheme} from '@yoroi/theme'
import * as React from 'react'
import {StyleSheet, Text} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'

import {Button} from '../../../../../components'
import {Space} from '../../../../../components/Space/Space'
import {useNavigateTo} from '../../../common/useNavigateTo'
import {useStrings} from '../../../common/useStrings'
import {ErrorLogo} from '../../../illustrations/ErrorLogo'

export const ExchangeErrorScreen = () => {
  const styles = useStyles()
  const strings = useStrings()
  const navigation = useNavigateTo()

  return (
    <SafeAreaView edges={['bottom', 'left', 'right']} style={styles.root}>
      <ErrorLogo />

      <Space height="l" />

      <Text style={styles.text}>{strings.linkError}</Text>

      <Space height="l" />

      <Button
        testID="rampOnOffErrorCloseButton"
        shelleyTheme
        title={strings.close}
        style={styles.button}
        onPress={navigation.exchangeCreateOrder}
      />
    </SafeAreaView>
  )
}

const useStyles = () => {
  const {theme} = useTheme()

  const styles = StyleSheet.create({
    root: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: '#fff',
      alignItems: 'center',
      justifyContent: 'center',
    },
    text: {
      ...theme.typography['heading-3-medium'],
      maxWidth: 340,
      textAlign: 'center',
    },
    button: {
      paddingHorizontal: 16,
    },
  })
  return styles
}
