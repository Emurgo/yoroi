import {useTheme} from '@yoroi/theme'
import React from 'react'
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native'
import LinearGradient from 'react-native-linear-gradient'
import Animated, {FadeInDown, FadeInUp, FadeOut, FadeOutDown, Layout} from 'react-native-reanimated'

import {useCopy} from '../../../../../src/legacy/useCopy'
import {Spacer} from '../../../../components'
import {SkeletonSmallCardAddress} from '../SkeletonAddressDetail/SkeletonAddressDetail'
import {useStrings} from '../useStrings'

export type SmallAddressCardProps = {
  address: string
  isUsed?: boolean
  loading?: boolean
  date?: string
  onPress?: () => void
  testId?: string
}

export const SmallAddressCard = ({address, isUsed, date, onPress, loading, testId}: SmallAddressCardProps) => {
  const strings = useStrings()
  const [isCopying, copy] = useCopy()
  const {styles, colors} = useStyles()

  if (loading)
    return (
      <View>
        <SkeletonSmallCardAddress />

        <Spacer height={16} />
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
            testID={testId}
          >
            <LinearGradient
              style={[StyleSheet.absoluteFill, {opacity: 1}]}
              start={{x: 0, y: 0}}
              end={{x: 0, y: 1}}
              colors={colors.bgCard}
            />

            <Text style={styles.textAddress}>{address}</Text>

            <Spacer height={12} />

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

        <Spacer height={16} />

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
  const {color, typography} = theme

  const styles = StyleSheet.create({
    smallAddressCard: {
      borderRadius: 8,
      width: '100%',
      alignItems: 'center',
      justifyContent: 'space-between',
      minHeight: 140,
      alignSelf: 'center',
      overflow: 'hidden',
      padding: 16,
    },
    textAddress: {
      ...atoms.body_1_lg_regular,
      color: color.gray_cmax,
    },
    footer: {
      width: '100%',
      justifyContent: 'space-between',
      flexDirection: 'row',
    },
    statusUnused: {
      borderRadius: 20,
      backgroundColor: color.secondary_c600,
      paddingVertical: 4,
      paddingHorizontal: 8,
      alignItems: 'center',
      justifyContent: 'center',
    },
    statusUnusedText: {
      color: color.gray_cmin,
      ...atoms.body_3_sm_medium,
      letterSpacing: 0.2,
    },
    statusUsed: {
      borderRadius: 20,
      backgroundColor: color.gray_cmin,
      paddingVertical: 4,
      paddingHorizontal: 8,
      alignItems: 'center',
      justifyContent: 'center',
    },
    statusUsedText: {
      ...atoms.body_3_sm_medium,
      lineHeight: 16,
      letterSpacing: 0.2,
      color: color.gray_cmax,
    },
    date: {
      ...atoms.body_2_md_regular,
      color: color.gray_c700,
    },
    copiedText: {
      color: color.gray_cmin,
      textAlign: 'center',
      padding: 8,
      ...atoms.body_2_md_medium,
    },
    isCopying: {
      position: 'absolute',
      backgroundColor: color.gray_cmax,
      alignItems: 'center',
      justifyContent: 'center',
      top: 0,
      alignSelf: 'center',
      borderRadius: 4,
      zIndex: 10,
    },
  })

  const colors = {
    bgCard: color.gradients['blue-green'],
  }

  return {styles, colors} as const
}
