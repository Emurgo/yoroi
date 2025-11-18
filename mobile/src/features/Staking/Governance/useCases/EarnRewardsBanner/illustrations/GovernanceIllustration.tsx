import * as React from 'react'
import {Image, ImageSourcePropType, StyleSheet} from 'react-native'

type Props = {
  size?: number
  color?: string
}

/**
 * Governance/DRep delegation illustration
 * Using the voting icon as placeholder - replace with governance-specific icon
 */
export const GovernanceIllustration = ({size = 100}: Props) => {
  const illustrationSource: ImageSourcePropType = require('~/assets/img/voting.png')

  return (
    <Image
      source={illustrationSource}
      style={[styles.illustration, {width: size, height: size}]}
      resizeMode="contain"
    />
  )
}

const styles = StyleSheet.create({
  illustration: {
    width: 100,
    height: 100,
  },
})

