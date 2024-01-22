import * as React from 'react'
import {defineMessages, useIntl} from 'react-intl'
import {StyleSheet, Text, View} from 'react-native'
import {Defs, LinearGradient, Path, Stop, Svg, SvgProps} from 'react-native-svg'

import {COLORS} from '../../theme'
import {Spacer} from '../Spacer'

const YOROI_COMPANY_NAME = 'Yoroi'

export const YoroiLogo = () => {
  const strings = useStrings()
  return (
    <View style={styles.yoroiLogo}>
      <YoroiLogoSvg />

      <Spacer height={10} />

      <Text style={styles.yoroiLogoTitle}>{YOROI_COMPANY_NAME}</Text>

      <Spacer height={10} />

      <Text style={styles.yoroiLogoText}>{strings.text}</Text>
    </View>
  )
}

const YoroiLogoSvg = (props: SvgProps) => {
  return (
    <Svg width={57} height={48} viewBox="0 0 57 48" fill="none" {...props}>
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M26.96 19.488L.5 0H8.81l19.62 14.003L48.147 0H56.5L29.909 19.488a2.555 2.555 0 01-2.95 0zm10.346 22.313L4.936 18.744v-6.607L42.527 38.7l-5.22 3.101zm1.566-13.484l11.486-8.495v-6.337L34.435 25.08l4.437 3.236zm10.18 7.281l1.306-1.078v-6.203l-5.743 4.045 4.437 3.236zM4.937 33.034L26.342 48l5.351-2.967L4.937 26.157v6.877z"
        fill="url(#paint0_linear_6040_147504)"
      />

      <Defs>
        <LinearGradient
          id="paint0_linear_6040_147504"
          x1={59.0114}
          y1={77.0656}
          x2={112.398}
          y2={-30.4088}
          gradientUnits="userSpaceOnUse"
        >
          <Stop stopColor="#244ABF" />

          <Stop offset={1} stopColor="#4760FF" />
        </LinearGradient>
      </Defs>
    </Svg>
  )
}

const styles = StyleSheet.create({
  yoroiLogo: {
    alignItems: 'center',
  },
  yoroiLogoTitle: {
    color: COLORS.SHELLEY_BLUE,
    fontSize: 30,
    fontWeight: '500',
    fontFamily: 'Rubik-Bold',
  },
  yoroiLogoText: {
    fontSize: 14,
    fontWeight: '400',
    fontFamily: 'Rubik',
    lineHeight: 22,
    color: '#242838',
  },
})

const useStrings = () => {
  const intl = useIntl()

  return {
    text: intl.formatMessage(messages.text),
  }
}

const messages = defineMessages({
  text: {
    id: 'components.yoroiLogo',
    defaultMessage: '!!!Light wallet for Cardano assets',
  },
})
