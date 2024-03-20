import {useNavigation} from '@react-navigation/native'
import {useTheme} from '@yoroi/theme'
import * as React from 'react'
import {StyleSheet, Text, View} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'

import {Button} from '../../../components'
import {useStatusBar} from '../../../components/hooks/useStatusBar'
import {Space} from '../../../components/Space/Space'
import {useStrings} from '../common/useStrings'
import {Biometric as BiometricIlustration} from '../illustrations/Biometric'

export const BiometricScreen = () => {
  useStatusBar()
  const {styles} = useStyles()
  const strings = useStrings()

  const navigation = useNavigation()

  return (
    <SafeAreaView edges={['left', 'right', 'top', 'bottom']} style={styles.root}>
      <View style={styles.content}>
        <View style={styles.illustration}>
          <BiometricIlustration />
        </View>

        <Space height="l" />

        <Text style={styles.biometricDescription}>{strings.biometricDescription}</Text>
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

        <Button title={strings.enableButton} style={styles.enableButton} />

        <Space height="s" />
      </View>
    </SafeAreaView>
  )
}

const useStyles = () => {
  const {theme} = useTheme()
  const styles = StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: theme.color['white-static'],
      ...theme.padding['x-l'],
    },
    content: {
      flex: 1,
      justifyContent: 'center',
    },
    illustration: {
      alignItems: 'center',
    },
    biometricDescription: {
      ...theme.typography['heading-3-medium'],
      color: theme.color.gray.max,
      textAlign: 'center',
      ...theme.padding['x-l'],
    },
    textOutlineButton: {color: theme.color.gray[900]},
    enableButton: {backgroundColor: theme.color.primary[500]},
  })

  return {styles} as const
}
