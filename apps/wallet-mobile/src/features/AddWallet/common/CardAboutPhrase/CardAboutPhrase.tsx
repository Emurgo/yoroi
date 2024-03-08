import {useTheme} from '@yoroi/theme'
import React from 'react'
import {StyleSheet, Text, View} from 'react-native'
import LinearGradient from 'react-native-linear-gradient'

import {Space} from '../../../../components/Space/Space'

type CardAboutPhraseProps = {
  items: string[]
  title?: string
  background?: boolean
  padding?: boolean
}

export const CardAboutPhrase = ({items, title, background, padding}: CardAboutPhraseProps) => {
  const {styles, colors} = useStyles(padding, background)

  return (
    <View style={styles.container}>
      {background && (
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

      {items?.map((item, i) => (
        <View key={i + '_ITEM_CARD'} style={styles.itemContainer}>
          <Text style={styles.bullet}>•</Text>

          <Space height="s" />

          <Text style={styles.item} ellipsizeMode="tail">
            {item}
          </Text>
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
    item: {
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
