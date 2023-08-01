import React from 'react'
import {defineMessages, useIntl} from 'react-intl'
import {ScrollView, StyleSheet, Switch, View} from 'react-native'

import {Button, Text} from '../../components'
import {useMetrics} from '../../metrics/metricsManager'
import {spacing} from '../../theme'
import {AnalyticsImage} from './AnalyticsImage'

type Props = {
  type: 'notice' | 'settings'
  onClose?: () => null
}

export const Analytics = ({type, onClose}: Props) => {
  const strings = useStrings()
  const metrics = useMetrics()

  return (
    <ScrollView style={styles.scrollView}>
      <View style={styles.content}>
        <View style={styles.heading}>
          <Text style={styles.title}>{strings.title}</Text>

          <AnalyticsImage />
        </View>

        <Text style={styles.paragraph}>{strings.header}</Text>

        <Text style={styles.paragraph}>{strings.description}</Text>

        <View style={styles.list}>
          {list.map(({style, icon, key}) => (
            <Text style={styles.text} key={key}>
              <Text style={style}>{icon}</Text>

              {strings[key]}
            </Text>
          ))}
        </View>

        <Text>{strings.more}</Text>
      </View>

      {type === 'notice' && (
        <View style={styles.buttons}>
          <Button
            block
            outlineShelley
            onPress={() => {
              metrics.disable()
              onClose?.()
            }}
            title={strings.skip}
            style={styles.button}
          />

          <Button
            block
            shelleyTheme
            onPress={() => {
              metrics.enable()
              onClose?.()
            }}
            title={strings.accept}
            style={styles.button}
          />
        </View>
      )}

      {type === 'settings' && (
        <View style={{display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
          <Text bold>{strings.toggle}</Text>

          <Switch
            value={metrics.isEnabled}
            onValueChange={() => (metrics.isEnabled ? metrics.disable() : metrics.enable())}
          />
        </View>
      )}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  scrollView: {
    paddingRight: 10,
  },
  text: {
    fontSize: 14,
    lineHeight: 22,
  },
  list: {
    marginBottom: spacing.paragraphBottomMargin,
  },
  paragraph: {
    marginBottom: spacing.paragraphBottomMargin,
    fontSize: 14,
    lineHeight: 22,
  },
  content: {
    flex: 1,
    marginBottom: 24,
  },
  heading: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.paragraphBottomMargin,
  },
  title: {
    fontSize: 20,
    lineHeight: 22,
    fontWeight: 'bold',
    marginBottom: spacing.paragraphBottomMargin,
  },
  buttons: {
    flexDirection: 'column',
    marginTop: 12,
  },
  button: {
    marginHorizontal: 10,
  },
  tick: {
    color: 'blue',
    marginRight: 12,
  },
  cross: {
    color: 'red',
    marginRight: 12,
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
    title: intl.formatMessage(messages.title),
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
  title: {
    id: 'components.analytics.title',
    defaultMessage: '!!!User insights',
  },
  header: {
    id: 'components.analytics.header',
    defaultMessage: '!!!Join the journey to improve Yoroi',
  },
  description: {
    id: 'components.analytics.description',
    defaultMessage: '!!!Share user insights to help us fine tune Yoroi to better serve your needs.',
  },
  anonymous: {
    id: 'components.analytics.anonymous',
    defaultMessage: '!!!Anonymous analytics data',
  },
  optout: {
    id: 'components.analytics.optout',
    defaultMessage: '!!!You can always opt-out via Settings',
  },
  private: {
    id: 'components.analytics.private',
    defaultMessage: '!!!We <b>cannot</b> access private keys',
  },
  noip: {
    id: 'components.analytics.noip',
    defaultMessage: '!!!We <b>are not</b> recording IP addresses',
  },
  nosell: {
    id: 'components.analytics.nosell',
    defaultMessage: '!!!We <b>do not</b> sell data',
  },
  more: {
    id: 'components.analytics.more',
    defaultMessage: '!!!Learn more about user insights',
  },
  skip: {
    id: 'components.analytics.skip',
    defaultMessage: '!!!Skip',
  },
  accept: {
    id: 'components.analytics.accept',
    defaultMessage: '!!!Accept',
  },
  toggle: {
    id: 'components.analytics.toggle',
    defaultMessage: '!!!Allow Yoroi analytics',
  },
})
