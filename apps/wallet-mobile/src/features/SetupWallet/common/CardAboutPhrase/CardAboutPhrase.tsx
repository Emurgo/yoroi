import {Blockies} from '@yoroi/identicon'
import {useTheme} from '@yoroi/theme'
import * as React from 'react'
import {Platform, StyleSheet, Text, View} from 'react-native'
import LinearGradient from 'react-native-linear-gradient'

import {Icon} from '../../../../components/Icon'
import {Space} from '../../../../components/Space/Space'
import {useStrings} from '../useStrings'

type CardAboutPhraseProps = {
  linesOfText: string[] | React.ReactNode[]
  title?: string
  showBackgroundColor?: boolean
  includeSpacing?: boolean
  checksumImage?: string
  checksumLine?: number
  testId?: string
}

export const CardAboutPhrase = ({
  linesOfText,
  title,
  showBackgroundColor,
  includeSpacing,
  checksumImage,
  checksumLine,
  testId,
}: CardAboutPhraseProps) => {
  const {styles, colors} = useStyles(includeSpacing, showBackgroundColor)
  const strings = useStrings()

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
          <Text style={styles.title} testID={testId}>
            {title}
          </Text>

          <Space height="sm" />
        </>
      )}

      {linesOfText.map((textLine, index) => {
        const handleShowChecksum = checksumImage !== undefined && checksumLine === index + 1
        return (
          <View key={index + '_ITEM_CARD'} style={styles.itemContainer}>
            <Text style={styles.bullet}>•</Text>

            <Space width="sm" />

            <Text style={styles.textLine}>
              {handleShowChecksum && (
                <>
                  {strings.walletChecksum}

                  <Space width="sm" />

                  <View style={styles.walletChecksumContainer}>
                    <Icon.WalletAvatar
                      image={new Blockies({seed: checksumImage}).asBase64()}
                      style={styles.walletChecksum}
                      size={24}
                    />
                  </View>
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
  const {color, atoms} = useTheme()

  const styles = StyleSheet.create({
    container: {
      borderRadius: 8,
      ...(padding ? atoms.p_lg : atoms.p_0),
      overflow: 'hidden',
    },
    title: {
      ...atoms.body_1_lg_medium,
      color: background ? color.primary_c600 : color.gray_c900,
      textAlign: 'center',
    },
    itemContainer: {
      flexDirection: 'row',
    },
    bullet: {
      ...atoms.body_1_lg_regular,
      color: background ? color.primary_c600 : color.gray_c900,
    },
    textLine: {
      flex: 1,
      ...atoms.body_1_lg_regular,
      color: background ? color.primary_c600 : color.gray_c900,
    },
    walletChecksum: {
      width: 23,
      height: 23,
      position: 'absolute',
      top: Platform.OS === 'ios' ? -22 : -18,
    },
    walletChecksumContainer: {
      position: 'relative',
      width: 30,
    },
  })

  const colors = {
    gradientBlueGreen: color.bg_gradient_1,
  }
  return {styles, colors} as const
}
