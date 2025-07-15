import {Blockies} from '@yoroi/identicon'
import {atoms as a, useTheme} from '@yoroi/theme'
import * as React from 'react'
import {Platform, StyleSheet, Text, View} from 'react-native'
import LinearGradient from 'react-native-linear-gradient'

import {useStrings} from '../../features/SetupWallet/common/useStrings'
import {Icon} from '../Icon'
import {Space} from '../Space/Space'

type CardAboutPhraseProps = {
  linesOfText: string[] | React.ReactNode[]
  title?: string
  showBackgroundColor?: boolean
  includeSpacing?: boolean
  checksumImage?: string
  checksumLine?: number
  testID?: string
}

export const CardAboutPhrase = ({
  linesOfText,
  title,
  showBackgroundColor,
  includeSpacing,
  checksumImage,
  checksumLine,
  testID,
}: CardAboutPhraseProps) => {
  const strings = useStrings()
  const {color} = useTheme()

  return (
    <View style={[styles.container, includeSpacing ? a.p_lg : a.p_0]}>
      {showBackgroundColor && (
        <LinearGradient
          style={[StyleSheet.absoluteFill, {opacity: 1}]}
          start={{x: 1, y: 0}}
          end={{x: 0, y: 0}}
          colors={color.bg_gradient_1}
        />
      )}

      {title !== undefined && (
        <>
          <Text
            style={[
              styles.title,
              {color: showBackgroundColor ? color.primary_600 : color.gray_900},
            ]}
            testID={testID}
          >
            {title}
          </Text>

          <Space height="sm" />
        </>
      )}

      {linesOfText.map((textLine, index) => {
        const handleShowChecksum =
          checksumImage !== undefined && checksumLine === index + 1
        return (
          <View key={index + '_ITEM_CARD'} style={styles.itemContainer}>
            <Text
              style={[
                styles.bullet,
                {
                  color: showBackgroundColor
                    ? color.primary_600
                    : color.gray_900,
                },
              ]}
            >
              •
            </Text>

            <Space width="sm" />

            <Text
              style={[
                styles.textLine,
                {
                  color: showBackgroundColor
                    ? color.primary_600
                    : color.gray_900,
                },
              ]}
            >
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

const styles = StyleSheet.create({
  container: {
    borderRadius: 8,
    overflow: 'hidden',
  },
  title: {
    ...a.body_1_lg_medium,
    textAlign: 'center',
  },
  itemContainer: {
    flexDirection: 'row',
  },
  bullet: {
    ...a.body_1_lg_regular,
  },
  textLine: {
    flex: 1,
    ...a.body_1_lg_regular,
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
