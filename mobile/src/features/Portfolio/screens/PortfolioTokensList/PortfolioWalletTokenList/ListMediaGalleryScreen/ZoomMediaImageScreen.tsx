import {atoms as a, useTheme} from '@yoroi/theme'

import * as React from 'react'
import {useWindowDimensions} from 'react-native'
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated'
import {Gesture, GestureDetector} from 'react-native-gesture-handler'

import {useSelectedWallet} from '~/features/WalletManager/hooks/useSelectedWallet'
import {useMetrics} from '~/kernel/metrics/metricsManager'
import {useParams} from '~/kernel/navigation/hooks/useParams'
import {NftRoutes} from '~/kernel/navigation/types'
import {FadeIn} from '~/ui/FadeIn/FadeIn'
import {MediaPreview} from '~/ui/MediaPreview/MediaPreview'
import {isEmptyString} from '~/wallets/utils/string'

type Params = NftRoutes['nft-details']

const isParams = (params?: Params | object | undefined): params is Params => {
  return !!params && 'id' in params && !isEmptyString(params.id)
}

export const ZoomMediaImageScreen = () => {
  const {palette: p, atoms: ta} = useTheme()
  const {id} = useParams<Params>(isParams)
  const {wallet} = useSelectedWallet()
  const dimensions = useWindowDimensions()

  // reading from the getter, there is no need to subscribe to changes
  const [amount] = React.useState(wallet.balances.records.get(id))

  const {track} = useMetrics()
  React.useEffect(() => {
    track.nftGalleryDetailsImageViewed()
  }, [track, id])

  // Shared values for animations
  const scale = useSharedValue(1)
  const translateX = useSharedValue(0)
  const translateY = useSharedValue(0)

  // Gesture state
  const lastScale = React.useRef(1)
  const lastTranslateX = React.useRef(0)
  const lastTranslateY = React.useRef(0)

  const pinchGesture = Gesture.Pinch()
    .onStart(() => {
      // Store the current scale when gesture starts
      lastScale.current = scale.value
    })
    .onUpdate((event: any) => {
      // Apply the pinch scale
      const newScale = lastScale.current * event.scale
      scale.value = Math.max(1, Math.min(3, newScale)) // Clamp between 1 and 3
    })
    .onEnd(() => {
      // Ensure scale is properly clamped
      if (scale.value < 1) {
        scale.value = withSpring(1)
      } else if (scale.value > 3) {
        scale.value = withSpring(3)
      }
    })

  const panGesture = Gesture.Pan()
    .onStart(() => {
      // Store current translation when gesture starts
      lastTranslateX.current = translateX.value
      lastTranslateY.current = translateY.value
    })
    .onUpdate((event: any) => {
      // Only allow panning when zoomed in
      if (scale.value > 1) {
        translateX.value = lastTranslateX.current + event.translationX
        translateY.value = lastTranslateY.current + event.translationY
      }
    })
    .onEnd(() => {
      // Apply spring animation for smooth finish
      translateX.value = withSpring(translateX.value)
      translateY.value = withSpring(translateY.value)
    })

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {scale: scale.value},
        {translateX: translateX.value},
        {translateY: translateY.value},
      ],
    }
  })

  // record can be gone when arriving here, need a state
  // TODO: revisit + product definition (missing is gone state)
  if (!amount) return null

  return (
    <FadeIn style={{...ta.bg_color_max, ...a.flex_1}}>
      <GestureDetector gesture={Gesture.Simultaneous(pinchGesture, panGesture)}>
        <Animated.View
          style={[
            a.flex,
            a.flex_1,
            a.h_full,
            a.flex_col,
            a.align_center,
            a.justify_center,
            animatedStyle,
          ]}
        >
          <MediaPreview
            info={amount.info}
            width={dimensions.width}
            height={dimensions.height}
            contentFit="contain"
            style={{backgroundColor: p.gray_100}}
          />
        </Animated.View>
      </GestureDetector>
    </FadeIn>
  )
}
