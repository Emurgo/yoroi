/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-native/no-raw-text */
import {useTheme} from '@yoroi/theme'
import * as shape from 'd3-shape'
import React, {memo, useMemo, useState} from 'react'
import {Dimensions, PanResponder, StyleSheet, View} from 'react-native'
import {Circle, G, Line, Rect, Text as SvgText} from 'react-native-svg'
import {LineChart as SvgLineChart} from 'react-native-svg-charts'

interface Props {
  dataSources?: {
    label: string
    value: number
  }[]
  onValueSelected: (value: number) => void
}

const TokenChartComponent = ({dataSources = [], onValueSelected}: Props) => {
  const {colors, styles} = useStyles()

  const {labelList, valueList, dataSize} = useMemo(() => {
    const dataChart = dataSources.reduce(
      (pre, next) => {
        return {
          labelList: [...pre.labelList, next.label],
          valueList: [...pre.valueList, next.value],
        }
      },
      {labelList: [], valueList: []} as {labelList: string[]; valueList: number[]},
    )

    return {
      labelList: dataChart.labelList,
      valueList: dataChart.valueList,
      dataSize: dataChart.labelList.length,
    }
  }, [dataSources])

  const [positionX, setPositionX] = useState(-1) // The currently selected X coordinate position

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onStartShouldSetPanResponderCapture: () => true,
    onMoveShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponderCapture: () => true,
    onPanResponderTerminationRequest: () => true,

    onPanResponderGrant: (evt) => {
      updatePosition(evt.nativeEvent.locationX)
      return true
    },
    onPanResponderMove: (evt) => {
      updatePosition(evt.nativeEvent.locationX)
      return true
    },
    onPanResponderRelease: () => {
      setPositionX(-1)
    },
  })

  const updatePosition = (x: number) => {
    if (dataSize === 0) return

    const screenWidth = Dimensions.get('window').width
    const x0 = 0 // x0 position
    const chartWidth = screenWidth - x0
    const xN = x0 + chartWidth // xN position
    const xDistance = chartWidth / dataSize // The width of each coordinate point

    if (x <= x0) {
      x = x0
    }
    if (x >= xN) {
      x = xN
    }

    let positionIndex = Math.floor((x - x0) / xDistance)
    if (positionIndex >= dataSize - 1) {
      positionIndex = dataSize - 1 // Out of chart range, automatic correction
    }

    setPositionX(positionIndex)
    onValueSelected(positionIndex)
  }

  const Tooltip = ({x, y}: any) => {
    if (positionX < 0) {
      return null
    }

    const price = valueList[positionX]

    const minPrice = Math.min(...valueList)

    const ttWidth = 98 // Width of tooltip
    const ttHeight = 34 // Height of tooltip
    const ttRadius = 8 // Radius of tooltip

    const centerY = y(price)
    const maxY = y(minPrice)

    const xPosition = x(positionX)

    const minX = x(0)
    const maxX = x(dataSize)

    let adjustedX = -ttWidth / 2
    // when hit the start edge of the screen we move the tooltip to the right
    if (xPosition <= minX + ttWidth) {
      adjustedX = minX
    }

    if (xPosition >= maxX - ttWidth) {
      adjustedX = -ttWidth
    }

    return (
      <G x={xPosition} key="tooltip">
        <G x={x}>
          {/* Vertical line for tooltip */}
          <Line y1={centerY} y2={maxY - 5} stroke={colors.stroke} strokeWidth={2} strokeDasharray={[6, 3]} />

          {/* Dot Circle or tooltip */}
          <Circle cy={centerY} r={8} stroke="#fff" strokeWidth={2} fill={colors.stroke} />
        </G>

        {/* Tooltip content */}
        <G x={adjustedX} y={y(minPrice + (ttHeight - 5))}>
          <Rect y={0} rx={ttRadius} ry={ttRadius} width={ttWidth} height={ttHeight} fill={colors.tooltip} />

          <SvgText x={6} y={ttHeight / 2 + 4} fontSize={12} fill={colors.tooltipText}>
            {labelList[positionX]}
          </SvgText>
        </G>
      </G>
    )
  }

  return (
    <View style={styles.root}>
      <View style={styles.fill} {...panResponder.panHandlers}>
        <SvgLineChart
          style={styles.fill}
          data={valueList}
          svg={{stroke: colors.stroke, strokeWidth: 2}}
          contentInset={{top: 16, bottom: 16}}
          curve={shape.curveNatural}
          animate={true}
          animationDuration={500}
        >
          <Tooltip />
        </SvgLineChart>
      </View>
    </View>
  )
}

const useStyles = () => {
  const {atoms, color} = useTheme()
  const styles = StyleSheet.create({
    root: {
      height: 144,
    },
    fill: {
      ...atoms.flex_1,
    },
  })

  const colors = {
    stroke: color.primary_c500,
    tooltip: color.primary_c500,
    tooltipText: color.primary_c200,
  }

  return {styles, colors} as const
}

export const TokenChart = memo(TokenChartComponent)
