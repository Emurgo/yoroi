import {atoms as a, useTheme} from '@yoroi/theme'
import React, {ReactNode} from 'react'
import {defineMessages, useIntl} from 'react-intl'
import {Text, TouchableOpacity, useWindowDimensions, View} from 'react-native'
import {ScrollView} from 'react-native-gesture-handler'

import {SettingsSwitch} from '~/features/Settings/common/SettingsSwitch'
import {useMetrics} from '~/kernel/metrics/metricsManager'
import {Button, ButtonType} from '~/ui/Button/Button'
import {Space, SpaceHeight} from '~/ui/Space/Space'
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
            title={strings.skip}
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
        <Button // accept button
          size="S"
          onPress={() => {
            metrics.enable()
            onClose?.()
          }}
          title={strings.accept}
        />
      </View>
    </View>
  )
}

const Settings = ({onReadMore}: {onReadMore?: () => void}) => {
  const strings = useStrings()
  const metrics = useMetrics()
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
        ref={scrollViewRef}
        persistentScrollbar={true}
        showsVerticalScrollIndicator={true}
      >
        <View style={{alignItems: 'center', paddingHorizontal: 16}}>
          <CommonContent onReadMore={onReadMore} />

          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <Text style={{...a.body_1_lg_medium, fontWeight: '500'}}>
              {strings.toggle}
            </Text>

            <SettingsSwitch
              value={metrics.isEnabled}
              onValueChange={() =>
                metrics.isEnabled ? metrics.disable() : metrics.enable()
              }
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
  const {atoms: ta, palette: p} = useTheme()

  const list = [
    {
      style: {color: p.primary_700, paddingRight: 8, fontSize: 16},
      icon: '✓',
      key: 'anonymous',
    },
    {
      style: {color: p.primary_700, paddingRight: 8, fontSize: 16},
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
      <Space.Height.md />

      {showLogo && (
        <>
          <YoroiLogo />

          <Space.Height.md />
        </>
      )}

      <AnalyticsImage />

      <Space.Height.md />

      <Text style={{...a.heading_3_medium, textAlign: 'center'}}>
        {strings.header}
      </Text>

      <Space.Height.md />

      <View style={{flex: 1, flexGrow: 1, alignSelf: 'flex-start'}}>
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

            <Text style={{...a.body_1_lg_regular}}>{strings[key]}</Text>
          </View>
        ))}
      </View>

      <Space.Height.md />

      <TouchableOpacity onPress={onReadMore}>
        <Text
          style={{color: p.primary_600, textAlign: 'center', ...a.link_1_lg}}
        >
          {strings.more}
        </Text>
      </TouchableOpacity>

      <Space.Height.md />
    </>
  )
}

const bold = {
  b: (text: ReactNode) => <Text style={a.body_2_md_medium}>{text}</Text>,
}

const useStrings = () => {
  const intl = useIntl()
  return {
    header: intl.formatMessage(messages.header),
    description: intl.formatMessage(messages.description),
    anonymous: intl.formatMessage(messages.anonymous),
    optout: intl.formatMessage(messages.optout),
    private: intl.formatMessage(messages.private, bold),
    noip: intl.formatMessage(messages.noip, bold),
    nosell: intl.formatMessage(messages.nosell, bold),
    more: intl.formatMessage(messages.more),
    skip: intl.formatMessage(messages.skip),
    accept: intl.formatMessage(messages.accept),
    toggle: intl.formatMessage(messages.toggle),
  }
}

const messages = defineMessages({
  header: {
    id: 'analytics.header',
    defaultMessage: '!!!Join the journey to improve Yoroi',
  },
  description: {
    id: 'analytics.description',
    defaultMessage:
      '!!!Share user insights to help us fine tune Yoroi to better serve your needs.',
  },
  anonymous: {
    id: 'analytics.anonymous',
    defaultMessage: '!!!Anonymous analytics data',
  },
  optout: {
    id: 'analytics.optout',
    defaultMessage: '!!!You can always opt-out via Settings',
  },
  private: {
    id: 'analytics.private',
    defaultMessage: '!!!We <b>cannot</b> access private keys',
  },
  noip: {
    id: 'analytics.noip',
    defaultMessage: '!!!We <b>are not</b> recording IP addresses',
  },
  nosell: {
    id: 'analytics.nosell',
    defaultMessage: '!!!We <b>do not</b> sell data',
  },
  more: {
    id: 'analytics.more',
    defaultMessage: '!!!Learn more about user insights',
  },
  skip: {
    id: 'analytics.skip',
    defaultMessage: '!!!Skip',
  },
  accept: {
    id: 'analytics.accept',
    defaultMessage: '!!!Accept',
  },
  toggle: {
    id: 'analytics.toggle',
    defaultMessage: '!!!Allow Yoroi analytics',
  },
})
