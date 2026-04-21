import {atoms as a, useTheme} from '@yoroi/theme'

import * as React from 'react'
import {Text, View} from 'react-native'

import {IllustrationStep1} from './illustrations/IllustrationStep1'
import {IllustrationStep2} from './illustrations/IllustrationStep2'
import {IllustrationStep3} from './illustrations/IllustrationStep3'
import {IllustrationStep4} from './illustrations/IllustrationStep4'

export type TeaserStep = {
  title: string
  subtitle: string
  illustration: React.ReactNode
}

export const teaserSteps: TeaserStep[] = [
  {
    title: 'Yoroi is reaching further.',
    subtitle: 'More chains, more of your financial life, all in one place.',
    illustration: <IllustrationStep1 />,
  },
  {
    title: "Soon, you'll have more options to grow.",
    subtitle: 'Your assets will be ready to get to work more, for you.',
    illustration: <IllustrationStep2 />,
  },
  {
    title: 'Your wallet in real life.',
    subtitle: 'Some upgrades you download. This one, you carry.',
    illustration: <IllustrationStep3 />,
  },
  {
    title: 'Your Yoroi wallet is getting bigger.',
    subtitle: 'Think neofinance that belongs entirely to you.',
    illustration: <IllustrationStep4 />,
  },
]

type TeaserContentProps = {
  step: TeaserStep
}

export const TeaserContent = ({step}: TeaserContentProps) => {
  const {palette: p} = useTheme()

  return (
    <View
      style={[a.flex_1, a.align_center, a.justify_center, a.gap_lg, a.px_lg]}
    >
      <View
        style={[{width: 280, height: 280}, a.align_center, a.justify_center]}
      >
        {step.illustration}
      </View>

      <View style={[a.gap_xs, a.align_center]}>
        <Text
          style={[
            a.body_1_lg_medium,
            a.text_center,
            {color: p.text_gray_max, fontWeight: '700'},
          ]}
        >
          {step.title}
        </Text>

        <Text
          style={[a.body_1_lg_regular, a.text_center, {color: p.text_gray_max}]}
        >
          {step.subtitle}
        </Text>
      </View>
    </View>
  )
}
