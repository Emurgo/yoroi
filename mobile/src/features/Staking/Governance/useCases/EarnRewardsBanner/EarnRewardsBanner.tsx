import {atoms as a, useTheme} from '@yoroi/theme'

import {LinearGradient} from 'expo-linear-gradient'
import * as React from 'react'
import {Image, Pressable, StyleSheet, Text, View} from 'react-native'

import GovernanceIllustration from '~/assets/img/governance-banner.png'
import {useStrings} from '~/kernel/i18n/useStrings'
import {Icon} from '~/ui/Icon'

type Props = {
  onPress: () => void
  onDismiss: () => void
}

export const EarnRewardsBanner = ({onPress, onDismiss}: Props) => {
  const strings = useStrings()
  const {palette: p} = useTheme()

  return (
    <View style={[a.p_lg, styles.container]}>
      <LinearGradient
        colors={['#E4E8F7', '#C6F7ED']}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 1}}
        style={styles.gradientBackground}
      />

      <Pressable
        onPress={onDismiss}
        style={styles.closeButton}
        hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}
        testID="earn-rewards-banner-close"
      >
        <Icon.Close size={24} color={p.gray_900} />
      </Pressable>

      <View style={styles.content}>
        <View style={styles.textContainer}>
          <Text
            style={[
              a.body_1_lg_medium,
              a.font_semibold,
              {color: p.gray_900},
              styles.title,
            ]}
          >
            {strings.staking.earnRewardsBannerTitle}
          </Text>

          <Text
            style={[
              a.body_2_md_regular,
              {color: p.gray_900},
              styles.description,
            ]}
          >
            {strings.staking.earnRewardsBannerDescription}
          </Text>

          <Pressable
            onPress={onPress}
            style={[
              styles.ctaButton,
              {
                borderColor: p.primary_600,
                backgroundColor: 'transparent',
              },
            ]}
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

      <View style={styles.illustrationContainer}>
        <Image
          source={GovernanceIllustration}
          style={styles.illustration}
          resizeMode="contain"
        />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 8,
    marginHorizontal: 16,
    paddingRight: 48,
    position: 'relative',
    minHeight: 182,
    overflow: 'hidden',
  },
  gradientBackground: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  },
  closeButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    zIndex: 1,
    padding: 4,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
  },
  textContainer: {
    flex: 1,
    paddingRight: 0,
    paddingTop: 0,
  },
  title: {
    marginBottom: 8,
    fontSize: 17,
    lineHeight: 24,
  },
  description: {
    marginBottom: 16,
    width: '90%',
    lineHeight: 22,
    fontSize: 14,
  },
  ctaButton: {
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 8,
    borderWidth: 2,
    alignSelf: 'flex-start',
  },
  illustrationContainer: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: 10,
    height: 140,
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
  },
  illustration: {
    width: 100,
    height: 120,
  },
})
