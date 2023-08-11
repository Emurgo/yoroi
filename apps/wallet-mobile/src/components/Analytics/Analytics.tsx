import React from 'react'
import {defineMessages, useIntl} from 'react-intl'
import {Dimensions, StyleSheet, Switch, TouchableOpacity, View} from 'react-native'
import {ScrollView} from 'react-native-gesture-handler'

import {Button, Spacer, Text, YoroiLogo} from '../../components'
import {useMetrics} from '../../metrics/metricsManager'
import {COLORS} from '../../theme'
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

// to display a border top in the button row
const NOTICE_COMPONENT_HEIGHT = 700
const BOTTOM_BUTTON_ROW_HEIGHT = 80

const Notice = ({onClose, onReadMore}: {onClose?: () => void; onReadMore?: () => void}) => {
  const strings = useStrings()
  const metrics = useMetrics()

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
        <View style={styles.content}>
          <CommonContent onReadMore={onReadMore} />

          <Button
            block
            outlineShelley
            onPress={() => {
              metrics.disable()
              onClose?.()
            }}
            title={strings.skip}
            style={styles.skip}
          />
        </View>
      </ScrollView>

      {/* To fill  bottom button space */}
      <Spacer height={BOTTOM_BUTTON_ROW_HEIGHT} />

      <View style={styles.buttonRow}>
        <Button
          block
          shelleyTheme
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
            <Text bold>{strings.toggle}</Text>

            <Spacer fill />

            <Switch
              value={metrics.isEnabled}
              onValueChange={() => (metrics.isEnabled ? metrics.disable() : metrics.enable())}
            />
          </View>
        </View>
      </ScrollView>
    </View>
  )
}

const CommonContent = ({onReadMore}: {onReadMore?: () => void}) => {
  const strings = useStrings()
  return (
    <>
      <Spacer height={12} />

      <YoroiLogo />

      <Spacer height={12} />

      <AnalyticsImage />

      <Spacer height={12} />

      <Text style={styles.title}>{strings.header}</Text>

      <Spacer height={12} />

      <View>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    alignItems: 'center',
  },
  text: {
    fontSize: 14,
    lineHeight: 22,
  },
  item: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  link: {
    color: COLORS.BLUE_LIGHTER,
    textAlign: 'center',
  },
  title: {
    fontSize: 20,
    lineHeight: 22,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  skip: {
    borderWidth: 0,
  },
  tick: {
    color: COLORS.DARK_BLUE,
    paddingRight: 8,
  },
  cross: {
    color: COLORS.RED,
    paddingRight: 8,
  },
  toggle: {
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  buttonRow: {
    width: '100%',
    position: 'absolute',
    bottom: 0,
    backgroundColor: '#fff',
    height: BOTTOM_BUTTON_ROW_HEIGHT,
    padding: 16,
    ...(Dimensions.get('window').height < NOTICE_COMPONENT_HEIGHT && {
      borderTopWidth: 1,
      borderTopColor: '#DCE0E9',
    }),
  },
})

const list = [
  {style: styles.tick, icon: '✓', key: 'anonymous'},
  {style: styles.tick, icon: '✓', key: 'optout'},
  {style: styles.cross, icon: '✕', key: 'private'},
  {style: styles.cross, icon: '✕', key: 'noip'},
  {style: styles.cross, icon: '✕', key: 'nosell'},
] as const

const bold = {b: (text) => <Text bold>{text}</Text>}

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
