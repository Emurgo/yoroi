import {useTheme} from '@yoroi/theme'
import React from 'react'
import {StyleSheet, Text, View} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'

import {Button} from '../../../../components/Button/Button'
import {Spacer} from '../../../../components/Spacer/Spacer'
import {useStrings} from '../strings'
import {ConectionErrorImage} from './ConectionErrorImage'

type ServiceUnavailableProps = {
  resetErrorBoundary?: () => void
}

export const ServiceUnavailable = ({resetErrorBoundary}: ServiceUnavailableProps) => {
  const strings = useStrings()
  const styles = useStyles()

  return (
    <SafeAreaView style={{flex: 1}} edges={['left', 'right', 'bottom']}>
      <View style={styles.container}>
        <ConectionErrorImage />

        <Spacer height={20} />

        <Text style={styles.title}>{strings.serviceUnavailable}</Text>

        <Text style={styles.text}>{strings.serviceUnavailableInfo}</Text>

        <Spacer height={20} />

        <Button onPress={resetErrorBoundary} title={strings.tryAgain} style={styles.button} shelleyTheme />
      </View>
    </SafeAreaView>
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
