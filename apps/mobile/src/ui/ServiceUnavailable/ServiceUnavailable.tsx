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
    <SafeAreaView style={{flex: 1}} edges={['left', 'right', 'bottom']}>
      <View style={[a.flex_1, a.align_center, a.justify_center, {padding: 16}]}>
        <ConectionErrorImage />

        <Space.Height.lg />

        <Text
          style={[
            a.heading_3_medium,
            {color: p.gray_max, padding: 4, textAlign: 'center'},
          ]}
        >
          {strings.serviceUnavailable}
        </Text>

        <Text
          style={[
            a.body_2_md_regular,
            {color: p.gray_600, textAlign: 'center', maxWidth: 300},
          ]}
        >
          {strings.serviceUnavailableInfo}
        </Text>

        <Space.Height.lg />

        <Button
          onPress={resetErrorBoundary}
          title={strings.tryAgain}
          style={{paddingHorizontal: 20}}
        />
      </View>
    </SafeAreaView>
  )
}
