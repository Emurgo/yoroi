import * as React from 'react'
import {StyleSheet, View} from 'react-native'
import Svg, {Defs, LinearGradient, Path, Stop} from 'react-native-svg'
import {ViewProps} from 'react-native-svg/lib/typescript/fabric/utils'

import {Space} from '../Space/Space'
import {useLoadingOverlay} from './LoadingOverlayContext'

export const LoadingOverlayScreen = () => {
  const {text} = useLoadingOverlay()

  return (
    <View style={styles.loading}>
      <YoroiLogo />

      <Space height="xl" />

      {text}
    </View>
  )
}

const YoroiLogo = (props: ViewProps) => {
  return (
    <Svg width={151} height={125} viewBox="0 0 151 125" fill="none" {...props}>
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M71.346 50.748L0 0h22.411l52.901 36.464L128.477 0H151L79.298 50.748a7.118 7.118 0 01-3.986 1.218 7.058 7.058 0 01-3.966-1.218zm27.896 58.101L11.965 48.807V31.602l101.354 69.171-14.077 8.076zm4.223-35.114l30.97-22.12V35.11L91.5 65.308l11.965 8.427zm27.452 18.962l3.519-2.809V73.736L118.951 84.27l11.966 8.427zM11.965 86.025l57.716 38.974 14.428-7.725-72.144-49.157v17.907z"
        fill="url(#paint0_linear_4318_134304)"
      />

      <Defs>
        <LinearGradient
          id="paint0_linear_4318_134304"
          x1={157.769}
          y1={200.688}
          x2={293.848}
          y2={-82.9631}
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
  loading: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
})
