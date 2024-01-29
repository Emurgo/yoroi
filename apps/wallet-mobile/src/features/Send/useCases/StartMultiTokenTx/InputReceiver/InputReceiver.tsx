import React from 'react'
import {Animated, Easing, StyleSheet, Text} from 'react-native'
import Svg, {Defs, LinearGradient, Path, Stop} from 'react-native-svg'

import {Icon, TextInput, TextInputProps} from '../../../../../components'
import {useNavigateTo} from '../../../common/navigation'
import {ScannerButton} from '../../../common/ScannerButton'
import {useStrings} from '../../../common/strings'
import {ShowResolvedAddressSelected} from './ShowResolvedAddressSelected'

export const InputReceiver = ({
  isLoading,
  isValid,
  ...props
}: {isLoading?: boolean; isValid?: boolean} & TextInputProps) => {
  const strings = useStrings()
  const navigateTo = useNavigateTo()

  const rightAdornment = isLoading ? (
    <Loading />
  ) : isValid ? (
    <Icon.Check size={25} color="#08C29D" />
  ) : (
    <ScannerButton onPress={navigateTo.reader} />
  )

  return (
    <TextInput
      right={rightAdornment}
      label={<Text style={styles.label}>{strings.addressInputLabel}</Text>}
      testID="receiverInput"
      style={styles.receiver}
      autoCorrect={false}
      focusable
      autoFocus
      errorOnMount
      showErrorOnBlur
      multiline
      blurOnSubmit
      helper={<ShowResolvedAddressSelected />}
      {...props}
    />
  )
}

const Loading = () => {
  const spin = React.useRef(new Animated.Value(0)).current

  React.useEffect(() => {
    Animated.loop(
      Animated.timing(spin, {
        toValue: 1,
        duration: 1500,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    ).start()
  }, [spin])

  const getRotationStyle = React.useCallback(() => {
    const rotate = spin.interpolate({
      inputRange: [0, 1],
      outputRange: ['0deg', '360deg'],
    })

    return {
      transform: [{rotate}],
    }
  }, [spin])

  return (
    <Animated.View style={[{padding: 4}, getRotationStyle()]}>
      <Svg width={22} height={22} viewBox="0 0 20 20" fill="none">
        <Path
          d="M1 10c-.552 0-1.005.449-.95.998A10 10 0 1010.998.05C10.448-.005 10 .448 10 1c0 .552.45.994.997 1.062a8 8 0 11-8.935 8.935C1.994 10.45 1.552 10 1 10z"
          fill="url(#paint0_linear_12263_40263)"
        />

        <Defs>
          <LinearGradient
            id="paint0_linear_12263_40263"
            x1={1.5}
            y1={11}
            x2={11.5}
            y2={1.5}
            gradientUnits="userSpaceOnUse"
          >
            <Stop stopColor="#3154CB" />

            <Stop offset={1} stopColor="#3154CB" stopOpacity={0.5} />
          </LinearGradient>
        </Defs>
      </Svg>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  receiver: {
    height: 120,
  },
  label: {
    fontSize: 15,
  },
})
