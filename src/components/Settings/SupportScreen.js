// @flow

import React from 'react'
import {connect} from 'react-redux'
import {compose} from 'redux'
import {withHandlers} from 'recompose'
import {View, TouchableOpacity, Linking, Image} from 'react-native'

import {withNavigationTitle} from '../../utils/renderUtils'
import {Text} from '../UiKit'
import chevronRight from '../../assets/img/chevron_right.png'

import styles from './styles/SupportScreen.style'

import type {SubTranslation} from '../../l10n/typeHelpers'

const getTranslations = (state) => state.trans.SupportScreen

const Item = ({title, text, url, onPress}) => (
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

const LinkingItem = withHandlers({
  onPress: ({url}: {url: string}) => () => Linking.openURL(url),
})(Item)

type Props = {
  translations: SubTranslation<typeof getTranslations>,
}

const SupportScreen = ({translations}: Props) => (
  <View style={styles.container}>
    <LinkingItem
      url={translations.faq.url}
      title={translations.faq.label}
      text={translations.faq.description}
    />
    <LinkingItem
      url={translations.report.url}
      title={translations.report.label}
      text={translations.report.description}
    />
  </View>
)

export default compose(
  connect((state) => ({
    translations: getTranslations(state),
  })),
  withNavigationTitle(({translations}) => translations.title),
)(SupportScreen)
