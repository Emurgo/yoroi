import {useTheme} from '@yoroi/theme'
import * as React from 'react'
import {Linking, StyleSheet, Text, View} from 'react-native'

import {Space} from '../../../../../components/Space/Space'
import {InfoModalIllustration} from './illustrations/InfoModalIllustration'
import {useStrings} from './strings'

export const InitialCollateralInfoModal = () => {
  const {styles} = useStyles()
  const strings = useStrings()

  return (
    <View style={styles.modal}>
      <InfoModalIllustration />

      <Text style={styles.modalText}>
        {strings.collateralInfoModalText}

        <Space width="_2xs" />

        <Link />
      </Text>

      <Space fill />
    </View>
  )
}

const learnMoreLink =
  'https://emurgohelpdesk.zendesk.com/hc/en-us/articles/11061970057743-About-the-collateral-mechanism-on-Cardano'

const Link = () => {
  const strings = useStrings()
  const {styles} = useStyles()

  const handleOnPress = () => {
    Linking.openURL(learnMoreLink)
  }

  return (
    <Text style={styles.link} onPress={handleOnPress}>
      {strings.learnMore}.
    </Text>
  )
}

const useStyles = () => {
  const {color, atoms} = useTheme()
  const styles = StyleSheet.create({
    modal: {
      ...atoms.flex_1,
      ...atoms.px_lg,
      ...atoms.align_center,
    },
    modalText: {
      ...atoms.text_center,
      ...atoms.body_1_lg_regular,
      color: color.text_gray_medium,
    },
    link: {
      ...atoms.link_1_lg_underline,
      color: color.text_primary_medium,
    },
  })

  const colors = {
    iconColor: color.gray_900,
  }

  return {styles, colors} as const
}
