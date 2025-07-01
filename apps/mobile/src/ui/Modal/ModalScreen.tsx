import {useFocusEffect} from '@react-navigation/native'
import {useCardAnimation} from '@react-navigation/stack'
import {atoms as a, useTheme} from '@yoroi/theme'
import React from 'react'
import {
  Animated,
  BackHandler,
  GestureResponderEvent,
  Pressable,
  Text,
  View,
} from 'react-native'
import {SafeAreaView, useSafeAreaInsets} from 'react-native-safe-area-context'

import {KeyboardAvoidingView} from '../KeyboardAvoidingView/KeyboardAvoidingView'
import {LoadingOverlay} from '../LoadingOverlay/LoadingOverlay'
import {ScrollView, useScrollView} from '../ScrollView/ScrollView'
import {Space} from '../Space/Space'
import {FullModalScreen} from './FullModalScreen'
import {useModal} from './ModalContext'

export const ModalScreen = () => {
  const {current} = useCardAnimation()
  const {
    height,
    closeModal,
    content,
    footer,
    isOpen,
    isLoading,
    full,
    canDiscard,
    title,
  } = useModal()
  const [swipeLocationY, setSwipeLocationY] = React.useState(height)
  const {bottom} = useSafeAreaInsets()
  const {isScrollBarShown, setIsScrollBarShown, scrollViewRef} = useScrollView()
  const {palette: p, atoms: ta, isDark} = useTheme()

  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        if (canDiscard) {
          closeModal()
        }
        return true
      }
      BackHandler.addEventListener('hardwareBackPress', onBackPress)
      return () =>
        BackHandler.removeEventListener('hardwareBackPress', onBackPress)
    }, [canDiscard, closeModal]),
  )

  const onResponderMove = ({nativeEvent}: GestureResponderEvent) => {
    if (swipeLocationY < nativeEvent.locationY && isOpen && canDiscard) {
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
    <SafeAreaView style={[a.flex_1, {backgroundColor: p.mobile_overlay}]}>
      <Pressable
        style={a.flex_grow}
        {...(canDiscard && {onPress: closeModal})}
      />

      <KeyboardAvoidingView
        style={[
          a.flex_1,
          a.align_center,
          a.justify_end,
          a.self_stretch,
          a.pb_lg,
        ]}
        keyboardVerticalOffset={0}
      >
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
            a.self_stretch,
          ]}
        >
          <View
            style={[
              {borderTopRightRadius: 20, borderTopLeftRadius: 20},
              {backgroundColor: isDark ? p.gray_50 : p.white_static},
              a.flex_1,
              a.self_stretch,
            ]}
          >
            <LoadingOverlay
              loading={isLoading}
              style={{borderTopRightRadius: 20, borderTopLeftRadius: 20}}
            />

            <View
              style={[a.align_center, a.self_stretch]}
              onResponderMove={onResponderMove}
              onStartShouldSetResponder={() => true}
            >
              <Space.Height.sm />

              <View
                style={[
                  ta.bg_color_max,
                  {
                    height: 4,
                    width: 32,
                    borderRadius: 10,
                  },
                ]}
              />

              <Space.Height.sm />

              {title !== '' && (
                <Text
                  style={[
                    a.text_center,
                    a.heading_3_medium,
                    a.p_lg,
                    {color: p.text_gray_max},
                  ]}
                >
                  {title}
                </Text>
              )}
            </View>

            <ScrollView
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={a.flex_grow}
              ref={scrollViewRef}
              onScrollBarChange={setIsScrollBarShown}
            >
              {content}
            </ScrollView>

            {footer !== undefined && (
              <View
                style={[
                  a.p_lg,
                  isScrollBarShown && {
                    borderTopWidth: 1,
                    borderTopColor: p.gray_200,
                  },
                ]}
              >
                {footer}
              </View>
            )}
          </View>
        </Animated.View>
      </KeyboardAvoidingView>

      <View
        style={[
          {backgroundColor: p.bg_color_max, bottom: 0, left: 0, right: 0},
          {height: bottom},
          a.self_stretch,
          a.absolute,
        ]}
      />
    </SafeAreaView>
  )
}
