import {useCardAnimation} from '@react-navigation/stack'
import {useTheme} from '@yoroi/theme'
import React from 'react'
import {Animated, GestureResponderEvent, Pressable, StyleSheet, Text, View} from 'react-native'
import {SafeAreaView, useSafeAreaInsets} from 'react-native-safe-area-context'

import {KeyboardAvoidingView} from '../KeyboardAvoidingView'
import {LoadingOverlay} from '../LoadingOverlay/LoadingOverlay'
import {Spacer} from '../Spacer'
import {FullModalScreen} from './FullModalScreen'
import {useModal} from './ModalContext'

export const ModalScreen = () => {
  const styles = useStyles()
  const {current} = useCardAnimation()
  const {height, closeModal, content, isOpen, isLoading, full} = useModal()
  const [swipeLocationY, setSwipeLocationY] = React.useState(height)
  // NOTE: this is to fill the bottom of the screen with the same color as the modal
  const {bottom} = useSafeAreaInsets()

  const onResponderMove = ({nativeEvent}: GestureResponderEvent) => {
    if (swipeLocationY < nativeEvent.locationY && isOpen) {
      setSwipeLocationY(height)
      closeModal()
      return
    }

    setSwipeLocationY(nativeEvent.locationY)
  }

  React.useEffect(() => {
    return () => closeModal()
  }, [closeModal])

  if (full) return <FullModalScreen>{content}</FullModalScreen>

  return (
    <SafeAreaView style={styles.backdrop}>
      <Pressable style={styles.cancellableArea} onPress={closeModal} />

      <KeyboardAvoidingView style={styles.root} keyboardVerticalOffset={0}>
        <Animated.View
          style={[
            {
              height: height,
              transform: [
                {
                  translateY: current.progress.interpolate({
                    inputRange: [0, 1],
                    outputRange: [height, 0],
                    extrapolate: 'clamp',
                  }),
                },
              ],
            },
            styles.animatedView,
          ]}
        >
          <View style={[styles.rounded, styles.sheet]}>
            <LoadingOverlay loading={isLoading} style={styles.rounded} />

            <Header onResponderMove={onResponderMove} onStartShouldSetResponder={() => true} />

            {content}
          </View>
        </Animated.View>
      </KeyboardAvoidingView>

      <View style={[styles.fixBottomColor, {height: bottom}]} />
    </SafeAreaView>
  )
}

const Header = (props: {
  onResponderMove?: (event: GestureResponderEvent) => void
  onStartShouldSetResponder?: () => boolean
}) => {
  const styles = useStyles()
  const {title} = useModal()
  return (
    <View style={styles.header} {...props}>
      <Spacer height={8} />

      <SliderIndicator />

      <Spacer height={8} />

      {title !== '' && <Text style={styles.title}>{title}</Text>}
    </View>
  )
}

const SliderIndicator = () => {
  const styles = useStyles()
  return <View style={styles.slider} />
}

const useStyles = () => {
  const {color, atoms, isDark} = useTheme()
  const styles = StyleSheet.create({
    root: {
      ...atoms.flex_1,
      ...atoms.align_center,
      ...atoms.justify_end,
      ...atoms.self_stretch,
      ...atoms.pb_lg,
    },
    cancellableArea: {
      ...atoms.flex_grow,
    },
    backdrop: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: color.mobile_overlay,
    },
    fixBottomColor: {
      backgroundColor: color.bg_color_max,
      bottom: 0,
      left: 0,
      right: 0,
      ...atoms.self_stretch,
      ...atoms.absolute,
    },
    animatedView: {
      ...atoms.self_stretch,
    },
    rounded: {
      borderTopRightRadius: 20,
      borderTopLeftRadius: 20,
    },
    sheet: {
      backgroundColor: isDark ? color.gray_50 : color.white_static,
      ...atoms.flex_1,
      ...atoms.self_stretch,
    },
    title: {
      ...atoms.heading_3_medium,
      ...atoms.p_lg,
      color: color.text_gray_max,
    },
    header: {
      ...atoms.align_center,
      ...atoms.self_stretch,
    },
    slider: {
      backgroundColor: color.gray_max,
      height: 4,
      width: 32,
      borderRadius: 10,
    },
  })
  return styles
}
