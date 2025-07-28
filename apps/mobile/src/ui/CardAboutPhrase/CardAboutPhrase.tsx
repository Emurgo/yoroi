import {Blockies} from '@yoroi/identicon'
import {atoms as a, useTheme} from '@yoroi/theme'
import {LinearGradient} from 'expo-linear-gradient'
import * as React from 'react'
import {Platform, StyleSheet, Text, View} from 'react-native'

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
  showBackgroundColor = false,
  includeSpacing = false,
  checksumImage,
  checksumLine,
  testID,
}: CardAboutPhraseProps) => {
  const strings = useStrings()
  const {palette: p} = useTheme()

  return (
    <View
      style={[
        {
          borderRadius: 8,
          overflow: 'hidden',
        },
        includeSpacing ? a.p_lg : a.p_0,
      ]}
    >
      {showBackgroundColor && (
        <LinearGradient
          style={[StyleSheet.absoluteFill, {opacity: 1}]}
          start={{x: 1, y: 0}}
          end={{x: 0, y: 0}}
          colors={p.bg_gradient_1}
        />
      )}

      {title !== undefined && (
        <>
          <Text
            style={[
              a.body_1_lg_medium,
              a.text_center,
              {color: showBackgroundColor ? p.primary_600 : p.gray_900},
            ]}
            testID={testID}
          >
            {title}
          </Text>
          <Space.Width.sm />
        </>
      )}

      {linesOfText.map((textLine, index) => {
        const handleShowChecksum =
          checksumImage !== undefined && checksumLine === index + 1

        return (
          <View key={`${index}_ITEM_CARD`} style={a.flex_row}>
            <Text
              style={[
                a.body_1_lg_regular,
                {color: showBackgroundColor ? p.primary_600 : p.gray_900},
              ]}
            >
              •
            </Text>

            <Space.Width.sm />

            <Text
              style={[
                a.flex_1,
                a.body_1_lg_regular,
                {color: showBackgroundColor ? p.primary_600 : p.gray_900},
              ]}
            >
              {handleShowChecksum && (
                <>
                  {strings.walletChecksum}
                  <Space.Width.sm />
                  <View
                    style={{
                      ...a.relative,
                      width: 30,
                    }}
                  >
                    <Icon.WalletAvatar
                      image={new Blockies({seed: checksumImage}).asBase64()}
                      style={{
                        width: 23,
                        height: 23,
                        ...a.absolute,
                        top: Platform.OS === 'ios' ? -22 : -18,
                      }}
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
