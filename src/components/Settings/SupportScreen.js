// @flow

import React from 'react'
import {connect} from 'react-redux'
import {compose} from 'redux'
import {View} from 'react-native'

import SettingsItemWithNavigation from './SettingsItemWithNavigation'

import styles from './styles/SupportScreen.style'

import type {SubTranslation} from '../../l10n/typeHelpers'

const getTranslation = (state) => state.trans.supportScreen

type Props = {
  translation: SubTranslation<typeof getTranslation>,
}

const SupportScreen = ({translation, navigateToFaq, navigateToReport}: Props) => (
  <View style={styles.root}>
    <SettingsItemWithNavigation
      label={translation.faqLabel}
      text={translation.faqText}
      navigateTo={translation.faqUrl}
    />
    <SettingsItemWithNavigation
      label={translation.reportLabel}
      text={translation.reportText}
      navigateTo={translation.reportUrl}
    />
  </View>
)

export default compose(
  connect((state) => ({
    translation: getTranslation(state),
  }))
)(SupportScreen)
