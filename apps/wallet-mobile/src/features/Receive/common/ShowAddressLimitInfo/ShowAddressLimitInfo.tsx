import {useTheme} from '@yoroi/theme'
import React from 'react'
import {Linking, StyleSheet, Text, TouchableWithoutFeedback} from 'react-native'
import Animated, {FadeInUp, FadeOut, LinearTransition} from 'react-native-reanimated'

import {Icon} from '../../../../components'
import {YoroiZendeskLink} from '../contants'
import {useStrings} from '../useStrings'

export const ShowAddressLimitInfo = () => {
  const strings = useStrings()
  const {styles, colors, color} = useStyles()

  return (
    <Animated.View layout={LinearTransition} entering={FadeInUp} exiting={FadeOut} style={styles.smallAddressCard}>
      <Icon.Info size={24} color={colors.icon} />

      <Text style={styles.text}>
        {strings.infoAddressLimit}

        <TouchableWithoutFeedback
          onPress={() => {
            Linking.openURL(YoroiZendeskLink)
          }}
        >
          <Text style={{color: color.primary_c500, borderWidth: 1}}>{strings.yoroiZendesk}</Text>
        </TouchableWithoutFeedback>
      </Text>
    </Animated.View>
  )
}

const useStyles = () => {
  const {color, atoms} = useTheme()

  const styles = StyleSheet.create({
    smallAddressCard: {
      alignSelf: 'stretch',
      borderRadius: 8,
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      gap: 12,
      padding: 16,
      backgroundColor: color.sys_cyan_c100,
    },
    text: {
      ...atoms.body_2_md_regular,
      color: color.gray_cmax,
    },
  })

  const colors = {
    icon: color.primary_c500,
  }

  return {styles, colors, color}
}
