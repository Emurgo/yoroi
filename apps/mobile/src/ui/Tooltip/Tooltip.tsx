import {atoms as a, useTheme} from '@yoroi/theme'
import * as React from 'react'
import {
  Dimensions,
  LayoutChangeEvent,
  Pressable,
  Text,
  View,
  ViewStyle,
} from 'react-native'
import {Portal} from 'react-native-paper'

import {addEventListener, getTooltipPosition, Measurement} from './utils'

type TooltipProps = {
  /**
   * Tooltip reference element. Needs to be able to hold a ref.
   */
  children: React.ReactElement
  /**
   * The number of milliseconds a user must touch the element before showing the tooltip.
   */
  enterTouchDelay?: number
  /**
   * The number of milliseconds after the user stops touching an element before hiding the tooltip.
   */
  leaveTouchDelay?: number
  /**
   * Tooltip title
   */
  title: string
  /**
   * Specifies the largest possible scale a title font can reach.
   */
  titleMaxFontSizeMultiplier?: number

  /**
   * Specifies the numberOfLine for Text component
   */
  numberOfLine?: number

  mode?: 'hover' | 'press'
}

/**
 * Tooltips display informative text when users hover over, focus on, or tap an element.
 *
 * Plain tooltips, when activated, display a text label identifying an element, such as a description of its function. Tooltips should include only short, descriptive text and avoid restating visible UI text.
 *
 */
export const Tooltip = ({
  children,
  enterTouchDelay = 500,
  leaveTouchDelay = 1500,
  title,
  titleMaxFontSizeMultiplier,
  numberOfLine,
  mode = 'press',
  ...rest
}: TooltipProps) => {
  const {palette: p} = useTheme()

  const [visible, setVisible] = React.useState(false)

  const [measurement, setMeasurement] = React.useState({
    children: {},
    tooltip: {},
    measured: false,
  })
  const showTooltipTimer = React.useRef<ReturnType<typeof setTimeout>[]>([])
  const hideTooltipTimer = React.useRef<ReturnType<typeof setTimeout>[]>([])
  const childrenWrapperRef = React.useRef() as React.MutableRefObject<View>
  const touched = React.useRef(false)

  React.useEffect(() => {
    return () => {
      if (showTooltipTimer.current.length > 0) {
        showTooltipTimer.current.forEach((t) => clearTimeout(t))
        showTooltipTimer.current = []
      }

      if (hideTooltipTimer.current.length > 0) {
        hideTooltipTimer.current.forEach((t) => clearTimeout(t))
        hideTooltipTimer.current = []
      }
    }
  }, [])

  React.useEffect(() => {
    const subscription = addEventListener(Dimensions, 'change', () =>
      setVisible(false),
    )

    return () => subscription.remove()
  }, [])

  const handleOnLayout = ({nativeEvent: {layout}}: LayoutChangeEvent) => {
    childrenWrapperRef.current.measure(
      (_x, _y, width, height, pageX, pageY) => {
        setMeasurement({
          children: {pageX, pageY, height, width},
          tooltip: {...layout},
          measured: true,
        })
      },
    )
  }

  const handleTouchStart = () => {
    if (hideTooltipTimer.current.length > 0) {
      hideTooltipTimer.current.forEach((t) => clearTimeout(t))
      hideTooltipTimer.current = []
    }

    touched.current = true
    setVisible(true)
  }

  const handleTouchEnd = () => {
    touched.current = false
    if (showTooltipTimer.current.length > 0) {
      showTooltipTimer.current.forEach((t) => clearTimeout(t))
      showTooltipTimer.current = []
    }

    const id = setTimeout(() => {
      setVisible(false)
      setMeasurement({children: {}, tooltip: {}, measured: false})
    }, leaveTouchDelay) as unknown as ReturnType<typeof setTimeout>
    hideTooltipTimer.current.push(id)
  }

  const composePressEvent = React.useCallback(() => {
    /** Toggle visibility when press */
    if (mode === 'press') {
      if (!visible) {
        setVisible(true)
      } else {
        setVisible(false)
        setMeasurement({children: {}, tooltip: {}, measured: false})
      }
      return
    }

    if (touched.current) {
      return null
    } else {
      if (children.props.disabled) return null
      return children.props.onPress?.()
    }
  }, [children.props, mode, visible])

  const pressProps =
    mode === 'hover'
      ? {
          onPress: composePressEvent,
          onLongPress: () => handleTouchStart(),
          onPressOut: () => handleTouchEnd(),
          delayLongPress: enterTouchDelay,
        }
      : {
          onPress: composePressEvent,
        }

  return (
    <>
      {visible && (
        <Portal>
          {/* Close it when touch on screen */}
          <Pressable
            style={{position: 'absolute', top: 0, left: 0, right: 0, bottom: 0}}
            onPress={() => setVisible(false)}
          >
            <View
              onLayout={handleOnLayout}
              style={[
                {
                  alignSelf: 'flex-start',
                  justifyContent: 'center',
                  paddingVertical: 5,
                  paddingHorizontal: 12,
                  borderRadius: 4,
                  position: 'absolute',
                  backgroundColor: p.gray_max,
                },
                {
                  ...getTooltipPosition(measurement as Measurement, children),
                  ...(measurement.measured ? {opacity: 1} : {opacity: 0}),
                },
              ]}
              testID="tooltip-container"
            >
              <Text
                style={[a.body_2_md_regular, {color: p.gray_min}]}
                accessibilityLiveRegion="polite"
                numberOfLines={numberOfLine}
                selectable={false}
                maxFontSizeMultiplier={titleMaxFontSizeMultiplier}
              >
                {title}
              </Text>
            </View>
          </Pressable>
        </Portal>
      )}

      <Pressable
        ref={childrenWrapperRef}
        style={{} as ViewStyle}
        {...pressProps}
      >
        {React.cloneElement(children, {
          ...rest,
          ...pressProps,
        })}
      </Pressable>
    </>
  )
}

Tooltip.displayName = 'Tooltip'
