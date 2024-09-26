import {useTheme} from '@yoroi/theme'
import React, {ReactNode} from 'react'
import {defineMessages, useIntl} from 'react-intl'
import {StyleSheet, TextStyle, TouchableOpacity, useWindowDimensions, View} from 'react-native'
import {ScrollView} from 'react-native-gesture-handler'

import {Button, ButtonType} from '../Button/Button'
import {Spacer} from '../../components/Spacer/Spacer'
import {Text} from '../../components/Text'
import {YoroiLogo} from '../../components/YoroiLogo/YoroiLogo'
import {SettingsSwitch} from '../../features/Settings/common/SettingsSwitch'
import {useMetrics} from '../../kernel/metrics/metricsManager'
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

const Notice = ({onClose, onReadMore}: {onClose?: () => void; onReadMore?: () => void}) => {
  const styles = useStyles()
  const strings = useStrings()
  const metrics = useMetrics()
  const {height: deviceHeight} = useWindowDimensions()
  const [contentHeight, setContentHeight] = React.useState(0)

  const scrollViewRef = React.useRef<ScrollView | null>(null)

  React.useEffect(() => {
    const timeout = setTimeout(() => {
      scrollViewRef.current?.flashScrollIndicators()
    }, 500)

    return () => clearTimeout(timeout)
  }, [])

  return (
    <View style={styles.container}>
      <ScrollView
        bounces={false}
        style={{flex: 1}}
        ref={scrollViewRef}
        persistentScrollbar={true}
        showsVerticalScrollIndicator={true}
      >
        <View
          style={styles.content}
          onLayout={(event) => {
            const {height} = event.nativeEvent.layout
            setContentHeight(height + BOTTOM_BUTTON_ROW_HEIGHT)
          }}
        >
          <CommonContent onReadMore={onReadMore} showLogo />

          <Button // skip button
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

      {/* To fill  bottom button space */}
      <Spacer height={BOTTOM_BUTTON_ROW_HEIGHT} />

      <View
        style={[
          styles.buttonRow,
          {
            // only show border top if the content is scrollable
            ...(deviceHeight < contentHeight && styles.borderTop),
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
  const styles = useStyles()

  const scrollViewRef = React.useRef<ScrollView | null>(null)

  React.useEffect(() => {
    const timeout = setTimeout(() => {
      scrollViewRef.current?.flashScrollIndicators()
    }, 500)

    return () => clearTimeout(timeout)
  }, [])

  return (
    <View style={styles.container}>
      <ScrollView bounces={false} ref={scrollViewRef} persistentScrollbar={true} showsVerticalScrollIndicator={true}>
        <View style={styles.content}>
          <CommonContent onReadMore={onReadMore} />

          <View style={styles.toggle}>
            <Text style={styles.toggle_text}>{strings.toggle}</Text>

            <Spacer fill />

            <SettingsSwitch
              value={metrics.isEnabled}
              onValueChange={() => (metrics.isEnabled ? metrics.disable() : metrics.enable())}
            />
          </View>
        </View>
      </ScrollView>
    </View>
  )
}

const CommonContent = ({onReadMore, showLogo}: {onReadMore?: () => void; showLogo?: boolean}) => {
  const strings = useStrings()
  const styles = useStyles()
  const list = uselist(styles)

  return (
    <>
      <Spacer height={12} />

      {showLogo && (
        <>
          <YoroiLogo />

          <Spacer height={12} />
        </>
      )}

      <AnalyticsImage />

      <Spacer height={12} />

      <Text style={styles.title}>{strings.header}</Text>

      <Spacer height={12} />

      <View style={styles.list}>
        {list.map(({style, icon, key}) => (
          <View key={key} style={styles.item}>
            <Text style={style}>{icon}</Text>

            <Text style={styles.text}>{strings[key]}</Text>
          </View>
        ))}
      </View>

      <Spacer height={12} />

      <TouchableOpacity onPress={onReadMore}>
        <Text style={styles.link}>{strings.more}</Text>
      </TouchableOpacity>

      <Spacer height={12} />
    </>
  )
}

const useStyles = () => {
  const {color, atoms} = useTheme()
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: color.bg_color_max,
    },
    content: {
      alignItems: 'center',
      paddingHorizontal: 16,
    },
    text: {
      ...atoms.body_1_lg_regular,
    },
    list: {
      flex: 1,
      flexGrow: 1,
      alignSelf: 'flex-start',
    },
    item: {
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'baseline',
    },
    link: {
      color: color.primary_600,
      textAlign: 'center',
      ...atoms.link_1_lg,
    },
    title: {
      ...atoms.heading_3_medium,
      textAlign: 'center',
    },
    tick: {
      color: color.primary_700,
      paddingRight: 8,
      fontSize: 16,
    },
    cross: {
      color: color.sys_magenta_500,
      paddingRight: 8,
      fontSize: 16,
    },
    toggle: {
      flexDirection: 'row',
      alignItems: 'center',
      fontSize: 24,
    },
    toggle_text: {
      ...atoms.body_1_lg_medium,
      fontWeight: '500',
    },
    buttonRow: {
      width: '100%',
      position: 'absolute',
      bottom: 0,
      backgroundColor: color.bg_color_max,
      height: BOTTOM_BUTTON_ROW_HEIGHT,
      padding: 16,
    },
    borderTop: {
      borderTopWidth: 1,
      borderTopColor: color.gray_500,
    },
  })

  return styles
}

type ListStyles = {
  tick: TextStyle
  cross: TextStyle
}

const uselist = (styles: ListStyles) => {
  return [
    {style: styles.tick, icon: '✓', key: 'anonymous'},
    {style: styles.tick, icon: '✓', key: 'optout'},
    {style: styles.cross, icon: '✕', key: 'private'},
    {style: styles.cross, icon: '✕', key: 'noip'},
    {style: styles.cross, icon: '✕', key: 'nosell'},
  ] as const
}

const bold = {b: (text: ReactNode) => <Text bold>{text}</Text>}

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
    defaultMessage: '!!!Share user insights to help us fine tune Yoroi to better serve your needs.',
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
