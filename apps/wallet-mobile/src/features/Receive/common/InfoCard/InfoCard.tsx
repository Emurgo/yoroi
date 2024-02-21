import {useTheme} from '@yoroi/theme'
import React from 'react'
import {StyleSheet, Text} from 'react-native'
import Animated, {FadeInUp, FadeOut, Layout} from 'react-native-reanimated'

import {Icon} from '../../../../../src/components'
import {mocks} from '../mocks'
import {useStrings} from '../useStrings'

type InfoCardProps = {
  onLimit: boolean
}

export const InfoCard = ({onLimit}: InfoCardProps) => {
  const strings = useStrings()

  const {styles, colors} = useStyles()

  if (!onLimit) return null

  return (
    <Animated.View layout={Layout} entering={FadeInUp} exiting={FadeOut} style={styles.smallAddressCard}>
      <Icon.Info size={24} color={colors.icon} />

      <Text style={styles.text}>
        {strings.infoAddressLimit}

        <Text style={[styles.text, {color: colors.yoroiZendesk}]}>{mocks.yoroiZendesk}</Text>
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