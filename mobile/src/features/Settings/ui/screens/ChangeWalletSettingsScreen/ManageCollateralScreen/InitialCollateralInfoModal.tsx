import {atoms as a, useTheme} from '@yoroi/theme'

import * as React from 'react'
import {Linking, ScrollView, Text} from 'react-native'

import {useStrings} from '~/kernel/i18n/useStrings'
import {Space} from '~/ui/Space/Space'

import {ColateralIlustration} from '../../../illustrations/ColateralIlustration'

export const InitialCollateralInfoModal = () => {
  const {atoms: ta} = useTheme()
  const strings = useStrings()

  return (
    <ScrollView
      style={[{maxHeight: 150}]}
      contentContainerStyle={[a.px_lg, a.align_center]}
    >
      <ColateralIlustration />

      <Text style={[a.text_center, a.body_1_lg_regular, ta.text_gray_medium]}>
        {strings.manageCollateral.collateralInfoModalText}

        <Space.Width._2xs />
      </Text>

      <Link />
    </ScrollView>
  )
}

const learnMoreLink =
  'https://emurgohelpdesk.zendesk.com/hc/en-us/articles/11061970057743-About-the-collateral-mechanism-on-Cardano'

const Link = () => {
  const strings = useStrings()
  const {atoms: ta} = useTheme()

  const handleOnPress = () => {
    Linking.openURL(learnMoreLink)
  }

  return (
    <Text
      style={[a.link_1_lg_underline, ta.text_primary_medium]}
      onPress={handleOnPress}
    >
      {strings.manageCollateral.learnMore}.
    </Text>
  )
}
