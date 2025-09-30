import {atoms as a, useTheme} from '@yoroi/theme'

import * as React from 'react'
import {Linking, Text, View} from 'react-native'

import {useStrings} from '~/kernel/i18n/useStrings'
import {Modal} from '~/ui/Modal/ui/screens/Modal/Modal'
import {Space} from '~/ui/Space/Space'

import {ColateralIlustration} from '../../../illustrations/ColateralIlustration'

export const InitialCollateralInfoModal = () => {
  const {atoms: ta} = useTheme()
  const strings = useStrings()

  return (
    <Modal.Content>
      <View style={[a.align_center]}>
        <ColateralIlustration />
      </View>

      <Text style={[a.body_1_lg_regular, ta.text_gray_medium]}>
        {strings.manageCollateral.collateralInfoModalText}
      </Text>

      <Space.Height.md />

      <Link />
    </Modal.Content>
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
