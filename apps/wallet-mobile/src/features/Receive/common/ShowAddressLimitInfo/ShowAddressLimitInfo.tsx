import {useTheme} from '@yoroi/theme'
import React from 'react'
import {Linking, StyleSheet, Text, TouchableWithoutFeedback} from 'react-native'
import Animated, {FadeInUp, FadeOut, Layout} from 'react-native-reanimated'

import {Icon} from '../../../../components'
import {YoroiZendeskLink} from '../contants'
import {useStrings} from '../useStrings'

export const ShowAddressLimitInfo = () => {
  const strings = useStrings()
  const {styles, colors} = useStyles()

  return (
    <Animated.View layout={Layout} entering={FadeInUp} exiting={FadeOut} style={styles.smallAddressCard}>
      <Icon.Info size={24} color={colors.icon} />

      <Text style={styles.text}>
        {strings.infoAddressLimit}

        <TouchableWithoutFeedback
          style={[styles.text, {color: colors.zendeskLink}]}
          onPress={() => {
            Linking.openURL(YoroiZendeskLink)
          }}
        >
          <Text style={{color: colors.zendeskLink, borderWidth: 1}}>{strings.yoroiZendesk}</Text>
        </TouchableWithoutFeedback>
      </Text>
    </Animated.View>
  )
}

const useStyles = () => {
  const {theme} = useTheme()

  const styles = StyleSheet.create({
    smallAddressCard: {
      alignSelf: 'stretch',
      borderRadius: 8,
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      gap: 12,
      padding: 16,
      backgroundColor: theme.color.cyan[100],
    },
    text: {
      ...theme.atoms.body_2_md_regular,
      color: theme.color.gray_cmax,
    },
  })

  const colors = {
    icon: theme.color.primary_c500,
    zendeskLink: theme.color.primary_c500,
  }

  return {styles, colors} as const
}
