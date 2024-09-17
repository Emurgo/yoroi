/* eslint-disable @typescript-eslint/strict-boolean-expressions */
import {useTheme} from '@yoroi/theme'
import * as React from 'react'
import {Dimensions, LayoutChangeEvent, Pressable, StyleSheet, Text, View, ViewStyle} from 'react-native'
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
  const {styles} = useStyles()

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
    const subscription = addEventListener(Dimensions, 'change', () => setVisible(false))

    return () => subscription.remove()
  }, [])

  const handleOnLayout = ({nativeEvent: {layout}}: LayoutChangeEvent) => {
    childrenWrapperRef.current.measure((_x, _y, width, height, pageX, pageY) => {
      setMeasurement({
        children: {pageX, pageY, height, width},
        tooltip: {...layout},
        measured: true,
      })
    })
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
          <Pressable style={{...StyleSheet.absoluteFillObject}} onPress={() => setVisible(false)}>
            <View
              onLayout={handleOnLayout}
              style={[
                styles.tooltip,
                {
                  ...getTooltipPosition(measurement as Measurement, children),
                  ...(measurement.measured ? styles.visible : styles.hidden),
                },
              ]}
              testID="tooltip-container"
            >
              <Text
                style={styles.content}
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

      <Pressable ref={childrenWrapperRef} style={styles.pressContainer} {...pressProps}>
        {React.cloneElement(children, {
          ...rest,
          ...pressProps,
        })}
      </Pressable>
    </>
  )
}

Tooltip.displayName = 'Tooltip'

const useStyles = () => {
  const {atoms, color} = useTheme()
  const styles = StyleSheet.create({
    tooltip: {
      alignSelf: 'flex-start',
      justifyContent: 'center',
      paddingVertical: 5,
      paddingHorizontal: 12,
      backgroundColor: color.gray_max,
      borderRadius: 4,
      position: 'absolute',
    },
    visible: {
      opacity: 1,
    },
    hidden: {
      opacity: 0,
    },
    content: {
      ...atoms.body_2_md_regular,
      color: color.gray_min,
    },
    pressContainer: {} as ViewStyle,
  })

  return {styles}
}
