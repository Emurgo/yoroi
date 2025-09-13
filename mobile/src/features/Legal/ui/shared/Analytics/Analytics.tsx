import {time} from '@yoroi/common'
import {atoms as a, useTheme} from '@yoroi/theme'

import * as React from 'react'
import {
  Linking,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native'
import {ScrollView} from 'react-native-gesture-handler'

import {useBold} from '~/hooks/useBold'
import {useStrings} from '~/kernel/i18n/useStrings'
import {useMetrics} from '~/kernel/metrics/metricsManager'
import {Button, ButtonType} from '~/ui/Button/Button'
import {Icon} from '~/ui/Icon'
import {SettingsSwitch} from '~/ui/SettingsSwitch/SettingsSwitch'
import {Space} from '~/ui/Space/Space'
import {YoroiLogo} from '~/ui/YoroiLogo/YoroiLogo'

import {AnalyticsIllustration} from '../../illustrations/AnalyticsIllustration'

type Props =
  | {
      type: 'notice'
      onNext: () => void
    }
  | {
      type: 'settings'
    }

export const Analytics = (props: Props) => {
  if (props.type === 'settings') return <Settings />
  return <Notice onNext={props.onNext} />
}

const Notice = ({onNext}: {onNext?: () => void}) => {
  const strings = useStrings()
  const metrics = useMetrics()
  const {height: deviceHeight} = useWindowDimensions()
  const [contentHeight, setContentHeight] = React.useState(0)
  const {palette: p, atoms: ta} = useTheme()

  const scrollViewRef = React.useRef<ScrollView | null>(null)

  React.useEffect(() => {
    const timeout = setTimeout(() => {
      scrollViewRef.current?.flashScrollIndicators()
    }, time.seconds(0.5))

    return () => clearTimeout(timeout)
  }, [])

  return (
    <View style={[a.flex_1]}>
      <ScrollView
        bounces={false}
        style={a.flex_1}
        contentContainerStyle={a.px_lg}
        ref={scrollViewRef}
        persistentScrollbar
        showsVerticalScrollIndicator
      >
        <View
          style={[a.align_center, a.px_lg]}
          onLayout={(event) => {
            const {height} = event.nativeEvent.layout
            setContentHeight(height + buttonHeight)
          }}
        >
          <Info showLogo />

          <Space.Height.lg />

          <Button
            size="S"
            type={ButtonType.Text}
            onPress={() => {
              metrics.disable()
              onNext?.()
            }}
            title={strings.ui.skip}
          />

          <Space.Height.lg />
        </View>
      </ScrollView>

      <View
        style={[
          a.absolute,
          a.w_full,
          ta.bg_color_max,
          a.h_full,
          a.px_lg,
          {
            bottom: 0,
            height: buttonHeight,
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
          type={ButtonType.Primary}
          onPress={() => {
            metrics.enable()
            onNext?.()
          }}
          title={strings.ui.accept}
        />
      </View>
    </View>
  )
}

const Settings = () => {
  const metrics = useMetrics()
  const {atoms: ta} = useTheme()
  const strings = useStrings()

  const handleOnValueChange = (value: boolean) => {
    if (value) {
      metrics.enable()
    } else {
      metrics.disable()
    }
  }

  return (
    <View style={[a.px_lg, a.gap_lg]}>
      <Info />

      <View style={[a.flex_row, a.align_center, a.justify_between]}>
        <Text style={[a.body_1_lg_medium, ta.text_gray_max]}>
          {strings.ui.toggle}
        </Text>

        <SettingsSwitch
          value={metrics.isEnabled}
          onValueChange={handleOnValueChange}
        />
      </View>
    </View>
  )
}

const Info = ({showLogo}: {showLogo?: boolean}) => {
  const strings = useStrings()
  const {palette: p, atoms: ta} = useTheme()
  const bold = useBold({style: a.body_1_lg_medium})

  const handleOnReadMore = () => {
    openReadMoreLink()
  }

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
    <View style={a.gap_lg}>
      {showLogo && (
        <>
          <Space.Height._2xl />
          <YoroiLogo />
          <Space.Height._2xl />
        </>
      )}

      <View style={a.align_center}>
        <AnalyticsIllustration />
      </View>

      <View style={a.align_center}>
        <Text style={[a.body_1_lg_medium, ta.text_gray_max]}>
          {strings.ui.analyticsHeader}
        </Text>
      </View>

      <View>
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

      <TouchableOpacity onPress={handleOnReadMore}>
        <Text style={[ta.text_primary_medium, a.text_center, a.link_1_lg]}>
          {strings.ui.more}
        </Text>
      </TouchableOpacity>
    </View>
  )
}

const openReadMoreLink = () => {
  Linking.openURL(
    'https://emurgohelpdesk.zendesk.com/hc/en-us/articles/7594394140303-What-s-user-insights-',
  )
}

const buttonHeight = 80
