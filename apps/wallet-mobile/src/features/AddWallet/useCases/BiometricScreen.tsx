import {useNavigation} from '@react-navigation/native'
import {useTheme} from '@yoroi/theme'
import * as React from 'react'
import {StyleSheet, Text, View} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'

import {Button, StatusBar} from '../../../components'
import {Space} from '../../../components/Space/Space'
import {useStrings} from '../common/useStrings'
import Biometric from '../illustrations/Biometric'

export const BiometricScreen = () => {
  const {styles} = useStyles()
  const strings = useStrings()

  const navigation = useNavigation()

  return (
    <SafeAreaView edges={['left', 'right', 'top', 'bottom']} style={styles.container}>
      <StatusBar type="light" />

      <View style={styles.content}>
        <View style={styles.logo}>
          <Biometric />
        </View>

        <Space height="l" />

        <Text style={styles.title}>{strings.biometricDescription}</Text>
      </View>

      <View>
        <Button
          title={strings.ignoreButton}
          outline
          textStyles={styles.textOutlineButton}
          onPress={() =>
            navigation.navigate('new-wallet', {
              screen: 'initial-choose-create-restore',
            })
          }
        />

        <Button title={strings.enableButton} style={styles.button} />

        <Space height="s" />
      </View>
    </SafeAreaView>
  )
}

const useStyles = () => {
  const {theme} = useTheme()
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.color['white-static'],
      ...theme.padding['x-l'],
    },
    content: {
      flex: 1,
      justifyContent: 'center',
    },
    logo: {
      alignItems: 'center',
    },
    title: {
      ...theme.typography['heading-3-medium'],
      color: theme.color.gray.max,
      textAlign: 'center',
      ...theme.padding['x-l'],
    },
    textOutlineButton: {color: theme.color.gray[900]},
    button: {backgroundColor: theme.color.primary[500]},
  })

  const colors = {
    gray900: theme.color.gray[900],
  }

  return {styles, colors} as const
}
