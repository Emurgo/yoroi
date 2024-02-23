import {useTheme} from '@yoroi/theme'
import React from 'react'
import {Linking, StyleSheet, Text, TouchableWithoutFeedback} from 'react-native'
import Animated, {FadeInUp, FadeOut, Layout} from 'react-native-reanimated'

import {Icon} from '../../../../components'
import {YoroiZendeskLink} from '../contants'
import {useStrings} from '../useStrings'

type ShowAddressLimitInfoProps = {
  onLimit: boolean
}

export const ShowAddressLimitInfo = ({onLimit}: ShowAddressLimitInfoProps) => {
  const strings = useStrings()

  const {styles, colors} = useStyles()

  if (!onLimit) return null

  return (
    <Animated.View layout={Layout} entering={FadeInUp} exiting={FadeOut} style={styles.smallAddressCard}>
      <Icon.Info size={24} color={colors.icon} />

      <Text style={styles.text}>
        {strings.infoAddressLimit}

        <TouchableWithoutFeedback
          style={[styles.text, {color: colors.yoroiZendesk}]}
          onPress={() => {
            Linking.openURL(YoroiZendeskLink)
          }}
        >
          <Text style={{color: colors.yoroiZendesk, borderWidth: 1}}>{strings.yoroiZendesk}</Text>
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
      ...theme.typography['body-2-m-regular'],
      color: theme.color.gray.max,
    },
  })

  const colors = {
    icon: theme.color.primary[500],
    yoroiZendesk: theme.color.primary[500],
  }

  return {styles, colors} as const
}
