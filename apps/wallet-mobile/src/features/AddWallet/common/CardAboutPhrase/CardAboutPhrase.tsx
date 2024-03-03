import {useTheme} from '@yoroi/theme'
import React from 'react'
import {StyleSheet, Text, View} from 'react-native'
import LinearGradient from 'react-native-linear-gradient'

type CardAboutPhraseProps = {
  items: string[]
}

export const CardAboutPhrase = ({items}: CardAboutPhraseProps) => {
  const {styles, colors} = useStyles()

  return (
    <View style={styles.container}>
      <LinearGradient
        style={[StyleSheet.absoluteFill, {opacity: 1}]}
        start={{x: 0, y: 0}}
        end={{x: 0, y: 1}}
        colors={colors.gradientBlueGreen}
      />

      {items?.map((item, i) => (
        <View key={i + '_ITEM_CARD'} style={styles.itemContainer}>
          <Text style={styles.bullet}>•</Text>

          <Text style={styles.item} ellipsizeMode="tail">
            {item}
          </Text>
        </View>
      ))}
    </View>
  )
}

const useStyles = () => {
  const {theme} = useTheme()
  const styles = StyleSheet.create({
    container: {
      borderRadius: 8,
      padding: 16,
      overflow: 'hidden',
    },
    itemContainer: {
      flexDirection: 'row',
      gap: 8,
    },
    bullet: {
      fontFamily: 'Rubik',
      fontWeight: '500',
      fontSize: 16,
      lineHeight: 24,
      color: theme.color.primary[600],
    },
    item: {
      flex: 1,
      fontFamily: 'Rubik',
      fontWeight: '400',
      fontSize: 16,
      lineHeight: 24,
      color: theme.color.primary[600],
    },
  })

  const colors = {
    gradientBlueGreen: theme.color.gradients['blue-green'],
  }
  return {styles, colors} as const
}
