import {atoms as a, useTheme} from '@yoroi/theme'

import * as React from 'react'
import {Linking, Text, View} from 'react-native'

import {useStrings} from '~/kernel/i18n/useStrings'
import {Space} from '~/ui/Space/Space'

import {ColateralIlustration} from '../../../illustrations/ColateralIlustration'

export const InitialCollateralInfoModal = () => {
  const {atoms: ta} = useTheme()
  const strings = useStrings()

  return (
    <View style={[a.flex_1, a.align_center]}>
      <ColateralIlustration />

      <Text style={[a.text_center, a.body_1_lg_regular, ta.text_gray_medium]}>
        {strings.manageCollateral.collateralInfoModalText}

        <Space.Width._2xs />

        <Link />
      </Text>

      <Space.Height.lg fill />
    </View>
  )
}

const learnMoreLink = 'https://help.yoroi-wallet.com/en/'

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
