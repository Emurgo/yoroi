import {useTheme} from '@yoroi/theme'
import * as React from 'react'
import {StyleSheet, Text, View} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'

import {Button, Spacer, StatusBar} from '../../../components'
import Biometric from '../illustrations/Biometric'
// import {useStrings} from '../common/useStrings'

export const BiometricScreen = () => {
  const {styles} = useStyles()
  //   const strings = useStrings()

  return (
    <SafeAreaView edges={['left', 'right', 'top', 'bottom']} style={styles.container}>
      <StatusBar type="light" />

      <View>
        <View style={styles.logo}>
          <Biometric />
        </View>

        <Spacer height={16} />

        <Text style={styles.title}>
          Use your device biometrics for a more convenient access to your Yoroi wallet and transaction confirmation
        </Text>
      </View>

      <View style={styles.buttonContainer}>
        <Button title="not now" outline textStyles={styles.textOutlineButton} />

        <Button title="eneble biometrics" style={styles.button} />

        <Spacer height={7} />
      </View>
    </SafeAreaView>
  )
}

const useStyles = () => {
  const {theme} = useTheme()
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      paddingHorizontal: 16,
      justifyContent: 'space-between',
    },
    logo: {
      alignItems: 'center',
    },
    title: {
      fontFamily: 'Rubik',
      fontWeight: '500',
      fontSize: 20,
      lineHeight: 30,
      color: theme.color.gray.max,
      textAlign: 'center',
      paddingHorizontal: 16,
    },
    buttonContainer: {},
    textOutlineButton: {color: theme.color.gray[900]},
    button: {backgroundColor: theme.color.primary[500]},
  })

  const colors = {
    gray900: theme.color.gray[900],
  }

  return {styles, colors} as const
}
