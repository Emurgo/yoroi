import {useTheme} from '@yoroi/theme'
import * as React from 'react'
import {StyleSheet, Text, View} from 'react-native'
import LinearGradient from 'react-native-linear-gradient'

import {Space} from '../../../../components/Space/Space'
import {WalletChecksum} from '../../illustrations/WalletChecksum'

type CardAboutPhraseProps = {
  linesOfText: string[] | React.ReactNode[]
  title?: string
  showBackgroundColor?: boolean
  includeSpacing?: boolean
  checksumImage?: string
  checksumLine?: number
}

export const CardAboutPhrase = ({
  linesOfText,
  title,
  showBackgroundColor,
  includeSpacing,
  checksumImage,
  checksumLine,
}: CardAboutPhraseProps) => {
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

      {linesOfText.map((textLine, index) => {
        const handleShowChecksum = checksumImage !== undefined && checksumLine === index + 1
        return (
          <View key={index + '_ITEM_CARD'} style={styles.itemContainer}>
            <Text style={styles.bullet}>•</Text>

            <Space height="s" />

            <Text style={styles.textLine}>
              {handleShowChecksum && (
                <>
                  <WalletChecksum iconSeed={checksumImage} style={styles.walletChecksum} />

                  <Space height="s" />
                </>
              )}

              {textLine}
            </Text>
          </View>
        )
      })}
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
      ...(theme.atoms.body - 1 - lg - medium),
      color: background ? theme.color.primary_c600 : theme.color.gray_c900,
      textAlign: 'center',
    },
    itemContainer: {
      flexDirection: 'row',
    },
    bullet: {
      ...theme.atoms.body_1_lg_regular,
      color: background ? theme.color.primary_c600 : theme.color.gray_c900,
    },
    textLine: {
      flex: 1,
      ...theme.atoms.body_1_lg_regular,
      color: background ? theme.color.primary_c600 : theme.color.gray_c900,
    },
    walletChecksum: {width: 24, height: 24},
  })

  const colors = {
    gradientBlueGreen: theme.color.gradients['blue-green'],
  }
  return {styles, colors} as const
}
