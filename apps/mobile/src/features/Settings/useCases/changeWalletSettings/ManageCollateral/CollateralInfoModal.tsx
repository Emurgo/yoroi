import {atoms as a, useTheme} from '@yoroi/theme'
import * as React from 'react'
import {Text, View} from 'react-native'

import {useStrings} from '~/kernel/i18n/useStrings'
import {InfoModalIllustration} from './illustrations/InfoModalIllustration'

export const CollateralInfoModal = () => {
  const {atoms: ta} = useTheme()
  const strings = useStrings()

  return (
    <View style={[a.flex_1, a.px_lg, a.align_center]}>
      <InfoModalIllustration />

      <Text style={[a.text_center, a.body_1_lg_regular, ta.text_gray_medium]}>
        {strings.manageCollateral.collateralInfoModalText}
      </Text>
    </View>
  )
}
