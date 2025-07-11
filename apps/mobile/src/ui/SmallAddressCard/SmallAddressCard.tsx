import {atoms as a, useTheme} from '@yoroi/theme'
import React from 'react'
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native'
import LinearGradient from 'react-native-linear-gradient'
import Animated, {FadeInUp, FadeOut, Layout} from 'react-native-reanimated'

import {useCopy} from '../../../kernel/utils/clipboard'
import {useStrings} from '../../features/Receive/common/useStrings'
import {SkeletonSmallCardAddress} from '../SkeletonAddressDetail/SkeletonAddressDetail'
import {Spacer} from '../Space/Space'

type SmallAddressCardProps = {
  address: string
  isUsed?: boolean
  loading?: boolean
  date?: string
  onPress?: () => void
  testID?: string
}

export const SmallAddressCard = ({
  address,
  isUsed,
  date,
  onPress,
  loading,
  testID,
}: SmallAddressCardProps) => {
  const strings = useStrings()
  const {copy} = useCopy()
  const {color} = useTheme()

  if (loading) {
    return (
      <View>
        <SkeletonSmallCardAddress />

        <Spacer height={16} />
      </View>
    )
  }

  return (
    <>
      <Animated.View layout={Layout} entering={FadeInUp} exiting={FadeOut}>
        <TouchableOpacity
          style={styles.smallAddressCard}
          activeOpacity={0.6}
          onLongPress={(event) =>
            copy({text: address, feedback: strings.addressCopiedMsg, event})
          }
          onPress={onPress}
          testID={testID}
        >
          <LinearGradient
            style={[StyleSheet.absoluteFill, {opacity: 1}]}
            start={{x: 0, y: 0}}
            end={{x: 0, y: 1}}
            colors={color.bg_gradient_1}
          />

          <Text style={[styles.textAddress, {color: color.gray_max}]}>
            {address}
          </Text>

          <Spacer height={12} />

          <View style={styles.footer}>
            <View
              style={[
                isUsed ? styles.statusUsed : styles.statusUnused,
                isUsed && {backgroundColor: color.bg_color_max},
                !isUsed && {backgroundColor: color.secondary_600},
              ]}
            >
              <Text
                style={[
                  isUsed ? styles.statusUsedText : styles.statusUnusedText,
                  isUsed && {color: color.gray_max},
                  !isUsed && {color: color.gray_min},
                ]}
              >
                {isUsed ? strings.usedAddress : strings.unusedAddress}
              </Text>
            </View>

            {isUsed && (
              <Text style={[styles.date, {color: color.gray_700}]}>{date}</Text>
            )}
          </View>
        </TouchableOpacity>
      </Animated.View>

      <Spacer height={16} />
    </>
  )
}

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
    ...a.body_1_lg_regular,
  },
  footer: {
    width: '100%',
    justifyContent: 'space-between',
    flexDirection: 'row',
  },
  statusUnused: {
    borderRadius: 20,
    paddingVertical: 4,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusUnusedText: {
    ...a.body_3_sm_medium,
    letterSpacing: 0.2,
  },
  statusUsed: {
    borderRadius: 20,
    paddingVertical: 4,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusUsedText: {
    ...a.body_3_sm_medium,
    lineHeight: 16,
    letterSpacing: 0.2,
  },
  date: {
    ...a.body_2_md_regular,
  },
})
