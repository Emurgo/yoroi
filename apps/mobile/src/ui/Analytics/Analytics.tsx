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
import { Icon } from '../../ui/Icon'

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
      {showLogo && (
        <>
          <Space.Height._2xl />
          <YoroiLogo />
          <Space.Height._2xl />
        </>
      )}

      <AnalyticsImage />

      <Space.Height.lg />

      <View style={{alignItems: 'center'}}>
        <Text style={[a.body_1_lg_medium, ta.text_gray_max]}>
          {strings.ui.analyticsHeader}
        </Text>

        <Space.Height.lg />

      </View>

      <View style={[a.gap_xs]}>
        {list.map(({icon, key}) => (
          <View
            key={key}
            style={[
              a.flex_row,
              a.align_center,  
            ]}
          >
            <View style={[a.pr_sm]}> 
              {icon}
            </View>

            <Text style={[a.body_1_lg_regular]}>
              {key === 'private' || key === 'noip' || key === 'nosell'
                ? strings.ui[key](bold)
                : strings.ui[key]}
            </Text>
          </View>
        ))}
      </View>

      <Space.Height.lg />

      <TouchableOpacity onPress={onReadMore}>
        <Text style={[ta.text_primary_medium, a.text_center, a.link_1_lg]}>
          {strings.ui.more}
        </Text>
      </TouchableOpacity>

      <Space.Height.md />
    </>
  )
}
