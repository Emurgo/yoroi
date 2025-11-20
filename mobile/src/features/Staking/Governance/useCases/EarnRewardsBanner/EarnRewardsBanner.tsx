import {atoms as a, useTheme} from '@yoroi/theme'

import * as React from 'react'
import {Image, Pressable, StyleSheet, Text, View} from 'react-native'

import drepIllustration from '~/assets/img/voting.png'
import {useStrings} from '~/kernel/i18n/useStrings'
import {Icon} from '~/ui/Icon'
import {Space} from '~/ui/Space/Space'

type Props = {
  onPress: () => void
  onDismiss: () => void
}

export const EarnRewardsBanner = ({onPress, onDismiss}: Props) => {
  const strings = useStrings()
  const {atoms: ta, palette: p} = useTheme()

  return (
    <View style={[styles.container, {backgroundColor: p.sys_cyan_100}]}>
      <Pressable
        onPress={onDismiss}
        style={styles.closeButton}
        hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}
      >
        <Icon.Cross size={20} color={p.gray_900} />
      </Pressable>

      <View style={styles.content}>
        <View style={styles.textContainer}>
          <Text
            style={[
              a.body_1_lg_medium,
              a.font_semibold,
              {color: p.gray_900},
              a.mb_xs,
            ]}
          >
            {strings.staking.earnRewardsBannerTitle}
          </Text>

          <Text style={[a.body_2_md_regular, {color: p.gray_900}, a.mb_md]}>
            {strings.staking.earnRewardsBannerDescription}
          </Text>

          <Pressable
            onPress={onPress}
            style={[
              styles.ctaButton,
              {
                backgroundColor: p.primary_600,
                borderColor: p.primary_600,
              },
            ]}
          >
            <Text
              style={[
                a.body_2_md_medium,
                a.font_semibold,
                {color: p.white_static},
              ]}
            >
              {strings.staking.earnRewardsBannerCta}
            </Text>
          </Pressable>
        </View>

        <View style={styles.illustrationContainer}>
          <Image
            source={drepIllustration}
            style={styles.illustration}
            resizeMode="contain"
          />
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 8,
    padding: 16,
    position: 'relative',
  },
  closeButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    zIndex: 1,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  textContainer: {
    flex: 1,
    paddingRight: 12,
  },
  ctaButton: {
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 8,
    borderWidth: 2,
    alignSelf: 'flex-start',
  },
  illustrationContainer: {
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  illustration: {
    width: 80,
    height: 80,
  },
})

