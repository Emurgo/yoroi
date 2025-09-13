import {atoms as a, useTheme} from '@yoroi/theme'

import * as React from 'react'
import {Text, TouchableOpacity, View, useWindowDimensions} from 'react-native'
import {ScrollView} from 'react-native-gesture-handler'

import {useBold} from '~/hooks/useBold'
import {useStrings} from '~/kernel/i18n/useStrings'
import {useMetrics} from '~/kernel/metrics/metricsManager'
import {Button, ButtonType} from '~/ui/Button/Button'
import {Space} from '~/ui/Space/Space'

import {Icon} from '../../ui/Icon'
import {SettingsSwitch} from '../SettingsSwitch/SettingsSwitch'
import {YoroiLogo} from '../YoroiLogo/YoroiLogo'
import {AnalyticsImage} from './AnalyticsImage'

type Props = {
  type: 'notice' | 'settings'
  onClose?: () => void
  onReadMore?: () => void
}

export const Analytics = ({type, onClose, onReadMore}: Props) => {
  if (type === 'settings') {
    return <Settings onReadMore={onReadMore} />
  }

  return <Notice onClose={onClose} onReadMore={onReadMore} />
}

const BOTTOM_BUTTON_ROW_HEIGHT = 80

const Notice = ({
  onClose,
  onReadMore,
}: {
  onClose?: () => void
  onReadMore?: () => void
}) => {
  const strings = useStrings()
  const metrics = useMetrics()
  const {height: deviceHeight} = useWindowDimensions()
  const [contentHeight, setContentHeight] = React.useState(0)
  const {atoms: ta, palette: p} = useTheme()

  const scrollViewRef = React.useRef<ScrollView | null>(null)

  React.useEffect(() => {
    const timeout = setTimeout(() => {
      scrollViewRef.current?.flashScrollIndicators()
    }, 500)

    return () => clearTimeout(timeout)
  }, [])

  return (
    <View style={[a.flex_1, ta.bg_color_max]}>
      <ScrollView
        bounces={false}
        style={[a.flex_1]}
        ref={scrollViewRef}
        persistentScrollbar={true}
        showsVerticalScrollIndicator={true}
      >
        <View
          style={[a.align_center, a.px_lg]}
          onLayout={(event) => {
            const {height} = event.nativeEvent.layout
            setContentHeight(height + BOTTOM_BUTTON_ROW_HEIGHT)
          }}
        >
          <CommonContent onReadMore={onReadMore} showLogo />

          <Button
            size="S"
            type={ButtonType.Text}
            onPress={() => {
              metrics.disable()
              onClose?.()
            }}
            title={strings.ui.skip}
          />
        </View>
      </ScrollView>

      <Space.Height.lg />

      <View
        style={[
          {
            width: '100%',
            position: 'absolute',
            bottom: 0,
            backgroundColor: p.bg_color_max,
            height: BOTTOM_BUTTON_ROW_HEIGHT,
            padding: 16,
          },
          {
            // only show border top if the content is scrollable
            ...(deviceHeight < contentHeight && {
              borderTopWidth: 1,
              borderTopColor: p.gray_500,
            }),
          },
        ]}
      >
        <Button
          size="S"
          type={ButtonType.Primary}
          onPress={() => {
            metrics.enable()
            onClose?.()
          }}
          title={strings.ui.accept}
        />
      </View>
    </View>
  )
}

const Settings = ({onReadMore}: {onReadMore?: () => void}) => {
  const metrics = useMetrics()
  const {atoms: ta} = useTheme()
  const strings = useStrings()

  const scrollViewRef = React.useRef<ScrollView | null>(null)

  React.useEffect(() => {
    const timeout = setTimeout(() => {
      scrollViewRef.current?.flashScrollIndicators()
    }, 500)

    return () => clearTimeout(timeout)
  }, [])

  return (
    <View style={[a.flex_1, ta.bg_color_max]}>
      <ScrollView
        bounces={false}
        ref={scrollViewRef}
        persistentScrollbar={true}
        showsVerticalScrollIndicator={true}
      >
        <View style={[a.flex_1, a.px_lg]}>
          <CommonContent onReadMore={onReadMore} />

          <View style={[a.flex_row, a.align_center]}>
            <Text style={[a.body_1_lg_medium, ta.text_gray_max]}>
              {strings.ui.toggle}
            </Text>

            <View style={[a.flex_1]} />

            <SettingsSwitch
              value={metrics.isEnabled}
              onValueChange={(value) => {
                if (value) {
                  metrics.enable()
                } else {
                  metrics.disable()
                }
              }}
            />
          </View>
        </View>
      </ScrollView>
    </View>
  )
}

const CommonContent = ({
  onReadMore,
  showLogo,
}: {
  onReadMore?: () => void
  showLogo?: boolean
}) => {
  const strings = useStrings()
  const {palette: p, atoms: ta} = useTheme()
  const bold = useBold({style: a.body_1_lg_medium})

  const list = [
    {
      icon: <Icon.CheckFilled size={16} color={p.sys_cyan_500} />,
      key: 'anonymous',
    },
    {
      icon: <Icon.CheckFilled size={16} color={p.sys_cyan_500} />,
      key: 'optout',
    },
    {
      icon: <Icon.CrossCircle size={16} color={p.sys_magenta_500} />,
      key: 'private',
    },
    {
      icon: <Icon.CrossCircle size={16} color={p.sys_magenta_500} />,
      key: 'noip',
    },
    {
      icon: <Icon.CrossCircle size={16} color={p.sys_magenta_500} />,
      key: 'nosell',
    },
  ] as const

  return (
    <>
      <Space.Height.sm />

      {showLogo && (
        <>
          <YoroiLogo />
          <Space.Height.sm />
        </>
      )}

      <AnalyticsImage />

      <Space.Height.sm />

      <Text style={[a.heading_3_medium, ta.text_gray_max, a.text_center]}>
        {strings.ui.analyticsHeader}
      </Text>

      <Space.Height.sm />

      <View style={[a.flex_1, a.flex_grow, a.self_start]}>
        {list.map(({icon, key}) => (
          <View key={key} style={[a.flex_row, a.align_center]}>
            <View style={[a.pr_sm]}>{icon}</View>

            <Text style={[a.body_1_lg_regular, ta.text_gray_max]}>
              {key === 'private' || key === 'noip' || key === 'nosell'
                ? strings.ui[key](bold)
                : strings.ui[key]}
            </Text>
          </View>
        ))}
      </View>

      <Space.Height.sm />

      <TouchableOpacity onPress={onReadMore}>
        <Text style={[a.link_1_lg, ta.text_primary_medium, a.text_center]}>
          {strings.ui.more}
        </Text>
      </TouchableOpacity>

      <Space.Height.sm />
    </>
  )
}
