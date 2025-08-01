import {atoms as a, useTheme} from '@yoroi/theme'
import React from 'react'
import {Text, TouchableOpacity, View} from 'react-native'
import {LinearGradient} from 'expo-linear-gradient'
import Animated, {FadeInUp, FadeOut, Layout} from 'react-native-reanimated'

import {useCopy} from '~/features/Copy/context/CopyProvider'
import {useStrings} from '~/kernel/i18n/useStrings'
import {Space} from '~/ui/Space/Space'
import {SkeletonSmallCardAddress} from '../SkeletonAddressDetail/SkeletonAddressDetail'

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
  const {palette: p} = useTheme()

  if (loading) {
    return (
      <View>
        <SkeletonSmallCardAddress />

        <Space.Height.md />
      </View>
    )
  }

  return (
    <>
      <Animated.View layout={Layout} entering={FadeInUp} exiting={FadeOut}>
        <TouchableOpacity
          style={[
            {
              borderRadius: 8,
              width: '100%',
              alignItems: 'center',
              justifyContent: 'space-between',
              minHeight: 140,
              alignSelf: 'center',
              overflow: 'hidden',
              padding: 16,
            },
          ]}
          activeOpacity={0.6}
          onLongPress={(event) =>
            copy({text: address, feedback: strings.receive.addressCopiedMsg, event})
          }
          onPress={onPress}
          testID={testID}
        >
          <LinearGradient
            style={[
              {
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                opacity: 1,
              },
            ]}
            start={{x: 0, y: 0}}
            end={{x: 0, y: 1}}
            colors={p.bg_gradient_1}
          />

          <Text style={[a.body_1_lg_regular, {color: p.gray_max}]}>
            {address}
          </Text>

          <Space.Height.sm />

          <View
            style={[
              {
                width: '100%',
                justifyContent: 'space-between',
                flexDirection: 'row',
              },
            ]}
          >
            <View
              style={[
                {
                  borderRadius: 20,
                  paddingVertical: 4,
                  paddingHorizontal: 8,
                  alignItems: 'center',
                  justifyContent: 'center',
                },
                isUsed && {backgroundColor: p.bg_color_max},
                !isUsed && {backgroundColor: p.secondary_600},
              ]}
            >
              <Text
                style={[
                  a.body_3_sm_medium,
                  {letterSpacing: 0.2},
                  isUsed && {color: p.gray_max, lineHeight: 16},
                  !isUsed && {color: p.gray_min},
                ]}
              >
                {isUsed ? strings.receive.usedAddress : strings.receive.unusedAddress}
              </Text>
            </View>

            {isUsed && (
              <Text style={[a.body_2_md_regular, {color: p.gray_700}]}>
                {date}
              </Text>
            )}
          </View>
        </TouchableOpacity>
      </Animated.View>

      <Space.Height.md />
    </>
  )
}
