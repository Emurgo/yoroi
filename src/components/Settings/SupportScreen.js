// @flow

import React from 'react'
import {View, TouchableOpacity, Linking, Image} from 'react-native'
import {injectIntl, defineMessages, type IntlShape} from 'react-intl'

import {Text, StatusBar} from '../UiKit'
import chevronRight from '../../assets/img/chevron_right.png'

import styles from './styles/SupportScreen.style'

const messages = defineMessages({
  faqLabel: {
    id: 'components.settings.settingsscreen.faqLabel',
    defaultMessage: 'See frequently asked questions',
    description: 'some desc',
  },
  faqDescription: {
    id: 'components.settings.settingsscreen.faqDescription',
    defaultMessage: 'If you are experiencing issues, please see the FAQ on Yoroi website for quidance on known issues.',
    description: 'some desc',
  },
  faqUrl: {
    id: 'components.settings.settingsscreen.faqUrl',
    defaultMessage: 'https://yoroi-wallet.com/faq/',
    description: 'some desc',
  },
  reportLabel: {
    id: 'components.settings.settingsscreen.reportLabel',
    defaultMessage: 'Report a problem',
    description: 'some desc',
  },
  reportDescription: {
    id: 'components.settings.settingsscreen.reportDescription',
    defaultMessage: 'If the FAQ does not solve the issue you are experiencing, please use our Support request feature.',
    description: 'some desc',
  },
  reportUrl: {
    id: 'components.settings.settingsscreen.reportUrl',
    defaultMessage: 'https://yoroi-wallet.com/support/',
    description: 'some desc',
  },
})

type LinkingItemProps = {
  url: string,
  title: string,
  text: string,
}
const LinkingItem = ({title, text, url}: LinkingItemProps) => {
  const onPress = () => Linking.openURL(url)

  return (
    <TouchableOpacity onPress={onPress} style={styles.item}>
      <View style={styles.itemWrap}>
        <Text style={styles.title}>{title}</Text>
        <Text secondary style={styles.text}>
          {text}
        </Text>
      </View>
      <Image source={chevronRight} />
    </TouchableOpacity>
  )
}

type Props = {
  intl: IntlShape,
}

const SupportScreen = ({intl}: Props) => (
  <View style={styles.container}>
    <StatusBar type="dark" />

    <LinkingItem
      url={intl.formatMessage(messages.faqUrl)}
      title={intl.formatMessage(messages.faqLabel)}
      text={intl.formatMessage(messages.faqDescription)}
    />
    <LinkingItem
      url={intl.formatMessage(messages.reportUrl)}
      title={intl.formatMessage(messages.reportLabel)}
      text={intl.formatMessage(messages.reportDescription)}
    />
  </View>
)

export default injectIntl(SupportScreen)
