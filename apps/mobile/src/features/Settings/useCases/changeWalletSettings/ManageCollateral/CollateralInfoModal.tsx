import {atoms as a, useTheme} from '@yoroi/theme'
import * as React from 'react'
import {Text, View} from 'react-native'

import {InfoModalIllustration} from './illustrations/InfoModalIllustration'
import {useStrings} from './strings'

export const CollateralInfoModal = () => {
  const {palette: p} = useTheme()
  const strings = useStrings()

  return (
    <View style={(a.flex_1, a.px_lg, a.align_center)}>
      <InfoModalIllustration />

      <Text
        style={[
          a.text_center,
          a.body_1_lg_regular,
          {color: p.text_gray_medium},
        ]}
      >
        {strings.collateralInfoModalText}
      </Text>
    </View>
  )
}
