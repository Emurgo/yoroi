import React from 'react'
import {StyleSheet, Text, View} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'

import {Button, Spacer} from '../../../../components'
import {COLORS} from '../../../../theme/config'
import {useStrings} from '../strings'
import {ConectionErrorImage} from './ConectionErrorImage'

type ServiceUnavailableProps = {
  resetErrorBoundary?: () => void
}

export const ServiceUnavailable = ({resetErrorBoundary}: ServiceUnavailableProps) => {
  const strings = useStrings()

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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  title: {
    color: COLORS.BLACK,
    fontWeight: '600',
    fontSize: 20,
    padding: 4,
    textAlign: 'center',
    lineHeight: 30,
  },
  text: {
    color: COLORS.TEXT_INPUT,
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 22,
    textAlign: 'center',
    maxWidth: 300,
  },
  button: {
    paddingHorizontal: 20,
  },
})
