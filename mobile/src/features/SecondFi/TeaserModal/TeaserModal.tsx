import {time} from '@yoroi/common'
import {atoms as a, useTheme} from '@yoroi/theme'

import * as React from 'react'
import {Pressable, Modal as RNModal, Text, View} from 'react-native'
import PagerView from 'react-native-pager-view'
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated'
import {useSafeAreaInsets} from 'react-native-safe-area-context'

import {Button} from '~/ui/Button/Button'

import {StepIndicator} from './StepIndicator'
import {TeaserContent, teaserSteps} from './TeaserContent'

type TeaserModalProps = {
  isOpen: boolean
  onClose: () => void
}

export const TeaserModal = ({isOpen, onClose}: TeaserModalProps) => {
  const {palette: p, isDark} = useTheme()
  const insets = useSafeAreaInsets()
  const [currentStep, setCurrentStep] = React.useState(1)
  const [isVisible, setIsVisible] = React.useState(false)
  const totalSteps = teaserSteps.length
  const pagerRef = React.useRef<PagerView>(null)

  const backdropOpacity = useSharedValue(0)
  const sheetTranslateY = useSharedValue(48)

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }))

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{translateY: sheetTranslateY.value}],
  }))

  React.useEffect(() => {
    if (isOpen) {
      setIsVisible(true)
      backdropOpacity.value = 0
      sheetTranslateY.value = 48

      backdropOpacity.value = withTiming(1, {duration: time.seconds(0.3)})
      sheetTranslateY.value = withSpring(0, {damping: 20, stiffness: 100})
    } else if (isVisible) {
      backdropOpacity.value = withTiming(
        0,
        {duration: time.seconds(0.3)},
        () => {
          runOnJS(setIsVisible)(false)
        },
      )
      sheetTranslateY.value = withSpring(48, {damping: 20, stiffness: 100})
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen])

  const handleNext = () => {
    if (currentStep < totalSteps) {
      pagerRef.current?.setPage(currentStep) // currentStep is 1-indexed, setPage is 0-indexed
    } else {
      handleClose()
    }
  }

  const handleSkip = () => {
    handleClose()
  }

  const handleClose = () => {
    setCurrentStep(1)
    onClose()
  }

  const handlePageSelected = (e: {nativeEvent: {position: number}}) => {
    setCurrentStep(e.nativeEvent.position + 1)
  }

  const isLastStep = currentStep === totalSteps

  if (!isVisible) return null

  return (
    <RNModal
      visible={isVisible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={handleSkip}
    >
      <View style={[a.flex_1]}>
        {/* Backdrop */}
        <Animated.View
          style={[
            a.absolute,
            a.inset_0,
            {backgroundColor: 'rgba(0,0,0,0.4)'},
            backdropStyle,
          ]}
        />

        <Pressable style={[a.flex_1]} onPress={handleSkip} />

        {/* Bottom Sheet */}
        <Animated.View
          style={[
            {
              backgroundColor: isDark ? p.gray_50 : p.white_static,
              borderTopLeftRadius: 16,
              borderTopRightRadius: 16,
              maxHeight: '85%',
            },
            sheetStyle,
          ]}
        >
          {/* Drag indicator */}
          <View style={[a.align_center, a.pt_sm]}>
            <View
              style={{
                width: 32,
                height: 4,
                borderRadius: 2,
                backgroundColor: p.gray_900,
              }}
            />
          </View>

          {/* Step indicator */}
          <View style={[a.py_lg]}>
            <StepIndicator currentStep={currentStep} totalSteps={totalSteps} />
          </View>

          {/* Content with swipe */}
          <PagerView
            ref={pagerRef}
            style={{height: 420}}
            initialPage={0}
            onPageSelected={handlePageSelected}
          >
            {teaserSteps.map((step, index) => (
              <View key={index}>
                <TeaserContent step={step} />
              </View>
            ))}
          </PagerView>

          {/* Footer buttons */}
          <View
            style={[
              a.px_lg,
              a.gap_lg,
              {
                paddingBottom: Math.max(insets.bottom, 16) + 24,
                paddingTop: 16,
              },
            ]}
          >
            <Button
              title={isLastStep ? 'CLOSE' : 'NEXT'}
              onPress={handleNext}
            />

            {!isLastStep && (
              <Pressable onPress={handleSkip} style={[a.align_center, a.py_xs]}>
                <Text
                  style={[
                    a.body_1_lg_medium,
                    {color: p.primary_500, letterSpacing: 0.5},
                  ]}
                >
                  SKIP
                </Text>
              </Pressable>
            )}
          </View>
        </Animated.View>
      </View>
    </RNModal>
  )
}
