import {useTheme} from '@yoroi/theme'
import * as React from 'react'
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native'
import LinearGradient from 'react-native-linear-gradient'

import {CreateWallet} from '../../illustrations/CreateWallet'
import {HardwareWallet} from '../../illustrations/HardwareWallet'
import {RestoreWallet} from '../../illustrations/RestoreWallet'
import {splitInLines} from '../splitInLines'

type ButtonCardProps = {
  title: string
  subTitle?: string
  icon?: 'create' | 'restore' | 'hardware' | null
  onPress: () => void
}

export const ButtonCard = ({title, subTitle, icon = null, onPress}: ButtonCardProps) => {
  const {styles, colors} = useStyles()

  const IconComponent = (component?: 'create' | 'restore' | 'hardware') => {
    switch (component) {
      case 'create':
        return <CreateWallet style={styles.icon} />
      case 'restore':
        return <RestoreWallet style={styles.icon} />
      case 'hardware':
        return <HardwareWallet style={styles.icon} />
      default:
        return null
    }
  }

  return (
    <TouchableOpacity
      activeOpacity={0.5}
      style={[styles.container, icon !== null && styles.justifySpaceBetween]}
      onPress={onPress}
    >
      <LinearGradient
        style={[StyleSheet.absoluteFill, {opacity: 1}]}
        start={{x: 0, y: 0}}
        end={{x: 0, y: 1}}
        colors={colors.gradientBlueGreen}
      />

      {icon !== null ? (
        <Text style={styles.title}>{splitInLines(title)}</Text>
      ) : (
        <View style={styles.textContainer}>
          <Text style={styles.titleCentre}>{title}</Text>

          {subTitle !== undefined && <Text style={styles.subTitle}>{subTitle}</Text>}
        </View>
      )}

      {icon !== null && IconComponent(icon)}
    </TouchableOpacity>
  )
}

const useStyles = () => {
  const {theme} = useTheme()
  const styles = StyleSheet.create({
    container: {
      borderRadius: 8,
      height: 120,
      flexDirection: 'row',
      alignItems: 'center',
      ...theme.padding['x-l'],
      overflow: 'hidden',
      justifyContent: 'center',
    },
    justifySpaceBetween: {
      justifyContent: 'space-between',
    },
    icon: {
      position: 'absolute',
      right: 0,
    },
    title: {
      ...theme.typography['heading-4-medium'],
      color: theme.color.gray.max,
    },
    titleCentre: {
      ...theme.typography['heading-4-medium'],
      color: theme.color['black-static'],
      textAlign: 'center',
    },
    subTitle: {
      ...theme.typography['body-1-l-regular'],
      color: theme.color.gray[900],
    },
    textContainer: {
      alignItems: 'center',
      justifyContent: 'center',
    },
  })

  const colors = {
    gradientBlueGreen: theme.color.gradients['blue-green'],
  }
  return {styles, colors} as const
}
