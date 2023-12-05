import React from 'react'
import {Animated, StyleSheet} from 'react-native'
import {Defs, Path, RadialGradient, Stop, Svg} from 'react-native-svg'

import {Icon, TextInput, TextInputProps} from '../../../../../components'
import {useNavigateTo} from '../../../common/navigation'
import {ScannerButton} from '../../../common/ScannerButton'
import {useStrings} from '../../../common/strings'

export const InputReceiver = ({
  isLoading,
  isValid,
  ...props
}: {isLoading: boolean; isValid: boolean} & TextInputProps) => {
  const strings = useStrings()
  const navigateTo = useNavigateTo()

  return (
    <TextInput
      right={
        isLoading ? (
          <Loading />
        ) : isValid ? (
          <Icon.Check size={30} color="#08C29D" />
        ) : (
          <ScannerButton onPress={navigateTo.reader} />
        )
      }
      label={strings.addressInputLabel}
      testID="receiverInput"
      style={styles.receiver}
      autoCorrect={false}
      focusable
      autoFocus
      errorOnMount
      showErrorOnBlur
      noHelper
      multiline
      blurOnSubmit
      {...props}
    />
  )
}

const Loading = (props) => {
  const spin = React.useRef(new Animated.Value(0)).current

  Animated.loop(
    Animated.timing(spin, {
      toValue: 1,
      duration: 1500,
      useNativeDriver: true,
    }),
  ).start()

  const getRotationStyle = () => {
    const rotate = spin.interpolate({
      inputRange: [0, 1],
      outputRange: ['0deg', '360deg'],
    })

    return {
      transform: [{rotate}],
    }
  }
  return (
    <Animated.View style={getRotationStyle()}>
      <Svg width={20} height={20} viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
        <Path
          d="M1 10c-.552 0-1.005.449-.95.998A10 10 0 1010.998.05C10.448-.005 10 .448 10 1c0 .552.45.994.997 1.062a8 8 0 11-8.935 8.935C1.994 10.45 1.552 10 1 10z"
          fill="url(#paint0_angular_12263_40263)"
        />

        <Defs>
          <RadialGradient
            id="paint0_angular_12263_40263"
            cx={0}
            cy={0}
            r={1}
            gradientUnits="userSpaceOnUse"
            gradientTransform="matrix(-9 1.49995 -1.49995 -9 10 10)"
          >
            <Stop offset={0.032392} stopColor="#3154CB" />

            <Stop offset={0.279782} stopColor="#3154CB" stopOpacity={0.3} />
          </RadialGradient>
        </Defs>
      </Svg>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  receiver: {
    height: 120,
  },
})
