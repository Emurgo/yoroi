// @flow

import React from 'react'
import {connect} from 'react-redux'
import {compose} from 'redux'
import {View} from 'react-native'

import SettingsItemWithNavigation from './SettingsItemWithNavigation'

import styles from './styles/SupportScreen.style'

import type {SubTranslation} from '../../l10n/typeHelpers'

const getTranslations = (state) => state.trans.supportScreen

type Props = {
  translations: SubTranslation<typeof getTranslations>,
}

const SupportScreen = ({translations}: Props) => (
  <View style={styles.root}>
    <SettingsItemWithNavigation
      label={translations.faq.label}
      description={translations.faq.description}
      dstUrl={translations.faq.url}
    />
    <SettingsItemWithNavigation
      label={translations.report.label}
      description={translations.report.description}
      dstUrl={translations.report.url}
    />
  </View>
)

export default compose(
  connect((state) => ({
    translations: getTranslations(state),
  }))
)(SupportScreen)
