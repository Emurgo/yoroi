import {useTheme} from '@yoroi/theme'
import React from 'react'
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native'
import LinearGradient from 'react-native-linear-gradient'
import Animated, {FadeInDown, FadeInUp, FadeOut, FadeOutDown, Layout} from 'react-native-reanimated'

import {useCopy} from '../../../../../src/legacy/useCopy'
import {SkeletonSmallCardAddress} from '../SkeletonAddressDetail/SkeletonAddressDetail'
import {useStrings} from '../useStrings'

export type SmallAddressCardProps = {
  address: string
  isUsed?: boolean
  loading?: boolean
  date?: string
  onPress?: () => void
}

export const SmallAddressCard = ({address, isUsed, date, onPress, loading}: SmallAddressCardProps) => {
  const strings = useStrings()
  const [isCopying, copy] = useCopy()

  const {styles, colors} = useStyles()

  if (loading)
    return (
      <View style={styles.skeleton}>
        <SkeletonSmallCardAddress />
      </View>
    )

  if (!loading)
    return (
      <>
        <Animated.View layout={Layout} entering={FadeInUp} exiting={FadeOut}>
          <TouchableOpacity
            style={styles.smallAddressCard}
            activeOpacity={0.6}
            onLongPress={() => copy(address)}
            onPress={onPress}
          >
            <LinearGradient
              style={[StyleSheet.absoluteFill, {opacity: 1}]}
              start={{x: 0, y: 0}}
              end={{x: 0, y: 1}}
              colors={colors.bgCard}
            />

            <Text style={styles.textAddress}>{address}</Text>

            <View style={styles.footer}>
              <View style={isUsed ? styles.statusUsed : styles.statusUnused}>
                <Text style={isUsed ? styles.statusUsedText : styles.statusUnusedText}>
                  {isUsed ? strings.usedAddress : strings.unusedAddress}
                </Text>
              </View>

              {isUsed && <Text style={styles.date}>{date}</Text>}
            </View>
          </TouchableOpacity>
        </Animated.View>

        {isCopying && (
          <Animated.View layout={Layout} entering={FadeInDown} exiting={FadeOutDown} style={styles.isCopying}>
            <Text style={styles.copiedText}>{strings.addressCopiedMsg}</Text>
          </Animated.View>
        )}
      </>
    )
}

const useStyles = () => {
  const {theme} = useTheme()

  const styles = StyleSheet.create({
    smallAddressCard: {
      borderRadius: 8,
      alignItems: 'stretch',
      justifyContent: 'space-between',
      height: 140,
      alignSelf: 'center',
      overflow: 'hidden',
      padding: 16,
      marginBottom: 16,
    },
    textAddress: {
      fontWeight: '400',
      fontSize: 16,
      lineHeight: 24,
      fontFamily: 'Rubik-Regular',
      color: theme.color['black-static'],
    },
    footer: {
      justifyContent: 'space-between',
      flexDirection: 'row',
    },
    statusUnused: {
      borderRadius: 20,
      backgroundColor: theme.color.secondary[600],
      paddingVertical: 6,
      paddingHorizontal: 10,
      alignItems: 'center',
      justifyContent: 'center',
    },
    statusUnusedText: {
      color: theme.color['white-static'],
      fontFamily: 'Rubik-Regular',
      fontWeight: '400',
      lineHeight: 16,
      fontSize: 12,
      letterSpacing: 0.2,
    },
    statusUsed: {
      borderRadius: 20,
      backgroundColor: theme.color['white-static'],
      paddingVertical: 6,
      paddingHorizontal: 10,
      alignItems: 'center',
      justifyContent: 'center',
    },
    statusUsedText: {
      fontFamily: 'Rubik-Regular',
      fontWeight: '400',
      lineHeight: 16,
      fontSize: 12,
      letterSpacing: 0.2,
      color: theme.color['black-static'],
    },
    date: {
      fontFamily: 'Rubik-Regular',
      fontWeight: '400',
      fontSize: 14,
      lineHeight: 22,
      color: theme.color.gray[700],
    },
    copiedText: {
      color: theme.color['white-static'],
      textAlign: 'center',
      padding: 8,
      fontSize: 14,
      fontWeight: '500',
      fontFamily: 'Rubik-Medium',
    },
    isCopying: {
      position: 'absolute',
      backgroundColor: theme.color['black-static'],
      alignItems: 'center',
      justifyContent: 'center',
      top: 0,
      alignSelf: 'center',
      borderRadius: 4,
      zIndex: 10,
    },
    skeleton: {
      marginBottom: 16,
    },
  })

  const colors = {
    bgCard: theme.color.gradients['blue-green'],
  }

  return {styles, colors} as const
}
