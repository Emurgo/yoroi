import {atoms as a, useTheme} from '@yoroi/theme'
import * as React from 'react'
import {Linking, Text, View} from 'react-native'

import {Space, SpaceHeight} from '../../../../../ui/Space/Space'
import {InfoModalIllustration} from './illustrations/InfoModalIllustration'
import {useStrings} from '~/kernel/i18n/useStrings'

export const InitialCollateralInfoModal = () => {
  const {atoms: ta} = useTheme()
  const strings = useStrings()

  return (
    <View style={[a.flex_1, a.px_lg, a.align_center]}>
      <InfoModalIllustration />

      <Text style={[a.text_center, a.body_1_lg_regular, ta.text_gray_medium]}>
        {strings.collateralInfoModalText}

        <Space.Width._2xs />

        <Link />
      </Text>

      <Space.Height.lg fill />
    </View>
  )
}

const learnMoreLink =
  'https://emurgohelpdesk.zendesk.com/hc/en-us/articles/11061970057743-About-the-collateral-mechanism-on-Cardano'

const Link = () => {
  const strings = useStrings()
  const {palette: p, atoms: ta} = useTheme()

  const handleOnPress = () => {
    Linking.openURL(learnMoreLink)
  }

  return (
    <Text
      style={[
        a.link_1_lg_underline,
        ta.text_primary_medium,
      ]}
      onPress={handleOnPress}
    >
      {strings.learnMore}.
    </Text>
  )
}
