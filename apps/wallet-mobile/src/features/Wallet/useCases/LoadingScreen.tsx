import {useTheme} from '@yoroi/theme'
import * as React from 'react'
import {StyleSheet, Text, View} from 'react-native'

import {Space} from '../../../components/Space/Space'
import {YoroiLogo} from '../illustrations/YoroiLogo'

type LoadingScreenProps = {
  title: string
}

export const LoadingScreen = ({title}: LoadingScreenProps) => {
  const {styles} = useStyles()

  return (
    <View style={styles.root}>
      <View style={styles.content}>
        <View style={styles.illustration}>
          <YoroiLogo height={118} width={137} />
        </View>

        <Space height="l" />

        <Text style={styles.title}>{title}</Text>
      </View>
    </View>
  )
}

const useStyles = () => {
  const {theme} = useTheme()
  const styles = StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: theme.color['white-static'],
      ...theme.padding['x-l'],
    },
    content: {
      flex: 1,
      justifyContent: 'center',
    },
    illustration: {
      alignItems: 'center',
    },
    title: {
      ...theme.typography['heading-2-medium'],
      color: theme.color.primary[500],
      textAlign: 'center',
      ...theme.padding['x-l'],
    },
  })

  return {styles} as const
}
