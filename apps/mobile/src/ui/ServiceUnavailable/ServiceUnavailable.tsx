import {atoms as a, useTheme} from '@yoroi/theme'

import * as React from 'react'
import {Text, View} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'

import {useStrings} from '~/kernel/i18n/useStrings'
import {Button} from '~/ui/Button/Button'
import {ConectionErrorImage} from '~/ui/ConectionErrorImage/ConectionErrorImage'
import {Space} from '~/ui/Space/Space'

type ServiceUnavailableProps = {
  resetErrorBoundary?: () => void
}

export const ServiceUnavailable = ({
  resetErrorBoundary,
}: ServiceUnavailableProps) => {
  const strings = useStrings()
  const {palette: p} = useTheme()

  return (
    <SafeAreaView style={a.flex_1} edges={['left', 'right', 'bottom']}>
      <View style={[a.flex_1, a.align_center, a.justify_center, a.p_lg]}>
        <ConectionErrorImage />

        <Space.Height.lg />

        <Text
          style={[
            a.heading_3_medium,
            a.text_center,
            {color: p.gray_max, padding: 4},
          ]}
        >
          {strings.swap.serviceUnavailable}
        </Text>

        <Text
          style={[
            a.body_2_md_regular,
            a.text_center,
            {color: p.gray_600, maxWidth: 300},
          ]}
        >
          {strings.swap.serviceUnavailableInfo}
        </Text>

        <Space.Height.lg />

        <Button
          onPress={resetErrorBoundary}
          title={strings.swap.tryAgain}
          style={a.px_xl}
        />
      </View>
    </SafeAreaView>
  )
}
