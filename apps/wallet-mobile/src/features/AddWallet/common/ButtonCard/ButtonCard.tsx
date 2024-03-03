import {useTheme} from '@yoroi/theme'
import React from 'react'
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native'
import LinearGradient from 'react-native-linear-gradient'

import CreateWallet from '../../illustrations/CreateWallet'
import HardwareWallet from '../../illustrations/HardwareWallet'
import RestoreWallet from '../../illustrations/RestoreWallet'

type IconProps = 'create' | 'restore' | 'hardware'

type ButtonCardProps = {
  title: string
  subTitle?: string
  icon?: IconProps
  onPress: () => void
}

export const ButtonCard = ({title, subTitle, icon, onPress}: ButtonCardProps) => {
  const {styles, colors} = useStyles(icon)

  function splitInLines(text: string): string {
    const words = text.trim().split(' ')
    let result = ''

    if (words.length <= 2) {
      result = text
    } else if (words.length === 3) {
      result = `${words[0]}\n${words[1]} ${words[2]}`
    } else {
      const halfIndex = Math.ceil(words.length / 2)
      const firstLine = words.slice(0, halfIndex).join(' ')
      const secondLine = words.slice(halfIndex).join(' ')
      result = `${firstLine}\n${secondLine}`
    }

    return result
  }

  const IconComponent = (component?: IconProps) => {
    switch (component) {
      case 'create':
        return <CreateWallet style={styles.icon} />
      case 'restore':
        return <RestoreWallet style={styles.icon} />
      case 'hardware':
        return <HardwareWallet style={styles.icon} />
      default:
        return undefined
    }
  }

  return (
    <TouchableOpacity activeOpacity={0.5} style={styles.container} onPress={onPress}>
      <LinearGradient
        style={[StyleSheet.absoluteFill, {opacity: 1}]}
        start={{x: 0, y: 0}}
        end={{x: 0, y: 1}}
        colors={colors.gradientBlueGreen}
      />

      {icon !== undefined ? (
        <Text style={styles.title}>{splitInLines(title)}</Text>
      ) : (
        <View style={styles.textContainer}>
          <Text style={styles.titleCentre}>{title}</Text>

          {subTitle !== undefined && <Text style={styles.subTitle}>{subTitle}</Text>}
        </View>
      )}

      {icon !== undefined && IconComponent(icon)}
    </TouchableOpacity>
  )
}

const useStyles = (icon?: IconProps) => {
  const {theme} = useTheme()
  const styles = StyleSheet.create({
    container: {
      borderRadius: 8,
      height: 120,
      flexDirection: 'row',
      justifyContent: icon !== undefined ? 'space-between' : 'center',
      alignItems: 'center',
      paddingHorizontal: 16,
      overflow: 'hidden',
    },
    icon: {
      position: 'absolute',
      right: 0,
    },
    title: {
      fontFamily: 'Rubik',
      fontWeight: '500',
      fontSize: 18,
      lineHeight: 26,
      color: theme.color['black-static'],
    },
    titleCentre: {
      fontFamily: 'Rubik',
      fontWeight: '500',
      fontSize: 18,
      lineHeight: 26,
      color: theme.color['black-static'],
      textAlign: 'center',
    },
    subTitle: {
      fontFamily: 'Rubik',
      fontWeight: '400',
      fontSize: 16,
      lineHeight: 24,
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
