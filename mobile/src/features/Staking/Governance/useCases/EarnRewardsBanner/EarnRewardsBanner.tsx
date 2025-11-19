import type {Gradient} from '@yoroi/theme'
import {atoms as a, useTheme} from '@yoroi/theme'

import {LinearGradient} from 'expo-linear-gradient'
import * as React from 'react'
import {Image, Pressable, Text, View} from 'react-native'

import GovernanceIllustration from '~/assets/img/governance-banner.png'
import {useStrings} from '~/kernel/i18n/useStrings'
import {Icon} from '~/ui/Icon'
import {Space} from '~/ui/Space/Space'

type Props = {
  onPress: () => void
  onDismiss: () => void
}

export const EarnRewardsBanner = ({onPress, onDismiss}: Props) => {
  const strings = useStrings()
  const {palette: p, isDark} = useTheme()

  const gradientColors: Gradient = isDark
    ? [p.secondary_100, p.primary_200]
    : p.bg_gradient_1

  return (
    <View
      style={[
        a.p_lg,
        a.relative,
        a.overflow_hidden,
        {
          borderRadius: 8,
          marginHorizontal: 16,
          paddingRight: 48,
          minHeight: 182,
        },
      ]}
    >
      <LinearGradient
        colors={gradientColors}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 1}}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
        }}
      />

      <Pressable
        onPress={onDismiss}
        style={{
          position: 'absolute',
          top: 12,
          right: 12,
          zIndex: 1,
          padding: 4,
        }}
        hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}
        testID="earn-rewards-banner-close"
      >
        <Icon.Close size={24} color={p.gray_900} />
      </Pressable>

      <View
        style={{
          flexDirection: 'row',
          alignItems: 'flex-start',
          justifyContent: 'flex-start',
        }}
      >
        <View
          style={{
            flex: 1,
            paddingRight: 0,
            paddingTop: 0,
          }}
        >
          <Text
            style={[a.body_1_lg_medium, a.font_semibold, {color: p.gray_900}]}
          >
            {strings.staking.earnRewardsBannerTitle}
          </Text>

          <Space.Height.sm />

          <Text
            style={[a.body_2_md_regular, {color: p.gray_900, width: '90%'}]}
          >
            {strings.staking.earnRewardsBannerDescription}
          </Text>

          <Space.Height.md />

          <Pressable
            onPress={onPress}
            style={{
              paddingVertical: 10,
              paddingHorizontal: 24,
              borderRadius: 8,
              borderWidth: 2,
              alignSelf: 'flex-start',
              borderColor: p.primary_600,
              backgroundColor: 'transparent',
            }}
            testID="earn-rewards-banner-cta"
          >
            <Text
              style={[
                a.body_2_md_medium,
                a.font_semibold,
                {color: p.primary_600},
              ]}
            >
              {strings.staking.earnRewardsBannerCta}
            </Text>
          </Pressable>
        </View>
      </View>

      <View
        style={{
          position: 'absolute',
          right: 0,
          bottom: 0,
          width: 10,
          height: 140,
          justifyContent: 'flex-end',
          alignItems: 'flex-end',
        }}
      >
        <Image
          source={GovernanceIllustration}
          style={{
            width: 100,
            height: 120,
          }}
          resizeMode="contain"
        />
      </View>
    </View>
  )
}
