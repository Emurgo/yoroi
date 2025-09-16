import {atoms as a, useTheme} from '@yoroi/theme'

import * as React from 'react'
import {Text, View} from 'react-native'

import {useStrings} from '~/kernel/i18n/useStrings'
import {ScrollView} from '~/ui/ScrollView/ScrollView'

import {ColateralIlustration} from '../../../illustrations/ColateralIlustration'

export const CollateralInfoModal = () => {
  const {atoms: ta} = useTheme()
  const strings = useStrings()

  return (
    <View style={[a.px_lg, a.align_center]}>
      <ScrollView contentContainerStyle={[]}>
        <ColateralIlustration />

        <Text style={[a.text_center, a.body_1_lg_regular, ta.text_gray_medium]}>
          {strings.manageCollateral.collateralInfoModalText}
        </Text>
      </ScrollView>
    </View>
  )
}
