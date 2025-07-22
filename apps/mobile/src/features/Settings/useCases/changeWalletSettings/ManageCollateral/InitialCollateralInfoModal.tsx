import {atoms as a, useTheme} from '@yoroi/theme'
import * as React from 'react'
import {Linking, StyleSheet, Text, View} from 'react-native'

import {Space, SpaceHeight} from '../../../../../ui/Space/Space'
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

        <Space.Width._2xs />

        <Link />
      </Text>

      <SpaceHeight fill size={'lg'} />
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
  const {palette: p} = useTheme()
  const styles = StyleSheet.create({
    modal: {
      ...a.flex_1,
      ...a.px_lg,
      ...a.align_center,
    },
    modalText: {
      ...a.text_center,
      ...a.body_1_lg_regular,
      color: p.text_gray_medium,
    },
    link: {
      ...a.link_1_lg_underline,
      color: p.text_primary_medium,
    },
  })

  const colors = {
    iconColor: p.gray_900,
  }

  return {styles, colors} as const
}
