import {useTheme} from '@yoroi/theme'
import React from 'react'
import {StyleSheet, Text, View} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'

import {Button} from '../../../ui/Button/Button'
import {ConectionErrorImage} from '../../../ui/ConectionErrorImage/ConectionErrorImage'
import {Spacer} from '../../../ui/Space/Space'
import {useStrings} from '../strings'

type ServiceUnavailableProps = {
  resetErrorBoundary?: () => void
}

export const ServiceUnavailable = ({
  resetErrorBoundary,
}: ServiceUnavailableProps) => {
  const strings = useStrings()
  const {color, atoms} = useTheme()

  return (
    <SafeAreaView style={{flex: 1}} edges={['left', 'right', 'bottom']}>
      <View
        style={[
          styles.container,
          atoms.flex_1,
          atoms.align_center,
          atoms.justify_center,
          {padding: 16},
        ]}
      >
        <ConectionErrorImage />

        <Spacer height={20} />

        <Text style={[styles.title, {color: color.gray_max}]}>
          {strings.serviceUnavailable}
        </Text>

        <Text style={[styles.text, {color: color.gray_600}]}>
          {strings.serviceUnavailableInfo}
        </Text>

        <Spacer height={20} />

        <Button
          onPress={resetErrorBoundary}
          title={strings.tryAgain}
          style={[styles.button, {paddingHorizontal: 20}]}
        />
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {},
  title: {
    ...a.heading_3_medium,
    padding: 4,
    textAlign: 'center',
  },
  text: {
    ...a.body_2_md_regular,
    textAlign: 'center',
    maxWidth: 300,
  },
  button: {},
})
