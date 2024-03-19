import {useTheme} from '@yoroi/theme'
import * as React from 'react'
import {StyleSheet, Text, View} from 'react-native'
import LinearGradient from 'react-native-linear-gradient'

import {Space} from '../../../../components/Space/Space'

type CardAboutPhraseProps = {
  linesOfText: string[]
  title?: string
  showBackgroundColor?: boolean
  includeSpacing?: boolean
}

export const CardAboutPhrase = ({linesOfText, title, showBackgroundColor, includeSpacing}: CardAboutPhraseProps) => {
  const {styles, colors} = useStyles(includeSpacing, showBackgroundColor)

  return (
    <View style={styles.container}>
      {showBackgroundColor && (
        <LinearGradient
          style={[StyleSheet.absoluteFill, {opacity: 1}]}
          start={{x: 1, y: 0}}
          end={{x: 0, y: 0}}
          colors={colors.gradientBlueGreen}
        />
      )}

      {title !== undefined && (
        <>
          <Text style={styles.title}>{title}</Text>

          <Space height="s" />
        </>
      )}

      {linesOfText.map((textLine, index) => (
        <View key={index + '_ITEM_CARD'} style={styles.itemContainer}>
          <Text style={styles.bullet}>•</Text>

          <Space height="s" />

          <Text style={styles.textLine}>{textLine}</Text>
        </View>
      ))}
    </View>
  )
}

const useStyles = (padding?: boolean, background?: boolean) => {
  const {theme} = useTheme()

  const styles = StyleSheet.create({
    container: {
      borderRadius: 8,
      ...theme.padding[padding ? 'l' : 'none'],
      overflow: 'hidden',
    },
    title: {
      ...theme.typography['body-1-l-medium'],
      color: background ? theme.color.primary[600] : theme.color.gray[900],
      textAlign: 'center',
    },
    itemContainer: {
      flexDirection: 'row',
    },
    bullet: {
      ...theme.typography['body-1-l-regular'],
      color: background ? theme.color.primary[600] : theme.color.gray[900],
    },
    textLine: {
      flex: 1,
      ...theme.typography['body-1-l-regular'],
      color: background ? theme.color.primary[600] : theme.color.gray[900],
    },
  })

  const colors = {
    gradientBlueGreen: theme.color.gradients['blue-green'],
  }
  return {styles, colors} as const
}
