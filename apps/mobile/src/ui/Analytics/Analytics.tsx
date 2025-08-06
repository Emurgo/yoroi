import {atoms as a, useTheme} from '@yoroi/theme'

import * as React from 'react'
import {Text, TouchableOpacity, useWindowDimensions, View} from 'react-native'
import {ScrollView} from 'react-native-gesture-handler'

import {useBold} from '~/hooks/useBold'
import {useStrings} from '~/kernel/i18n/useStrings'
import {useMetrics} from '~/kernel/metrics/metricsManager'
import {Button, ButtonType} from '~/ui/Button/Button'
import {Space} from '~/ui/Space/Space'

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
    <View style={{flex: 1, backgroundColor: p.bg_color_max}}>
      <ScrollView
        bounces={false}
        style={{flex: 1}}
        ref={scrollViewRef}
        persistentScrollbar={true}
        showsVerticalScrollIndicator={true}
      >
        <View
          style={{alignItems: 'center', paddingHorizontal: 16}}
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

      <Space.Height._2xl />

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
  const strings = useStrings()
  const metrics = useMetrics()
  const {atoms: ta, palette: p} = useTheme()

  return (
    <View style={{flex: 1, backgroundColor: p.bg_color_max}}>
      <View style={{flex: 1, paddingHorizontal: 16}}>
        <CommonContent onReadMore={onReadMore} />

        <Space.Height.lg />

        <SettingsSwitch
          value={metrics.isEnabled}
          onValueChange={(value) => {
            if (value) {
              metrics.enable()
            } else {
              metrics.disable()
            }
          }}
          // TODO: REVISIT it looks the API has changed for this component
          // title={strings.ui.toggle}
        />
      </View>
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
  const {atoms: ta, palette: p} = useTheme()
  const bold = useBold({style: a.body_1_lg_medium})

  const list = [
    {
      style: {color: p.sys_magenta_500, paddingRight: 8, fontSize: 16},
      icon: '✓',
      key: 'optout',
    },
    {
      style: {color: p.sys_magenta_500, paddingRight: 8, fontSize: 16},
      icon: '✕',
      key: 'private',
    },
    {
      style: {color: p.sys_magenta_500, paddingRight: 8, fontSize: 16},
      icon: '✕',
      key: 'noip',
    },
    {
      style: {color: p.sys_magenta_500, paddingRight: 8, fontSize: 16},
      icon: '✕',
      key: 'nosell',
    },
  ] as const

  return (
    <>
      {showLogo && (
        <>
          <Space.Height._2xl />
          <YoroiLogo />
          <Space.Height._2xl />
        </>
      )}

      <Text style={[a.heading_1_medium, ta.text_gray_max]}>
        {strings.ui.header}
      </Text>

      <Space.Height.md />

      <Text style={[a.body_1_lg_regular, ta.text_gray_medium]}>
        {strings.ui.description}
      </Text>

      <Space.Height.lg />

      <AnalyticsImage />

      <Space.Height.lg />

      <View style={{alignItems: 'center'}}>
        <Text style={[a.body_1_lg_medium, ta.text_gray_max]}>
          {strings.ui.anonymous}
        </Text>

        <Space.Height.xs />

        <Text style={[a.body_2_md_regular, ta.text_gray_medium]}>
          {strings.ui.optout}
        </Text>
      </View>

      <Space.Height.lg />

      <View style={{gap: 8}}>
        {list.map(({style, icon, key}) => (
          <View
            key={key}
            style={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'baseline',
            }}
          >
            <Text style={style}>{icon}</Text>

            <Text style={[a.body_1_lg_regular]}>
              {key === 'private' || key === 'noip' || key === 'nosell'
                ? strings.ui[key](bold)
                : strings.ui[key]}
            </Text>
          </View>
        ))}
      </View>

      <Space.Height.md />

      <TouchableOpacity onPress={onReadMore}>
        <Text style={[ta.text_primary_medium, a.text_center, a.link_1_lg]}>
          {strings.ui.more}
        </Text>
      </TouchableOpacity>

      <Space.Height.md />
    </>
  )
}
