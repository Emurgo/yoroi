// @flow

import React from 'react'
import {connect} from 'react-redux'
import {compose} from 'redux'
import {View} from 'react-native'

import SettingsItem from './SettingsItem'
import CopyIcon from '../../assets/CopyIcon'

import styles from './styles/SupportScreen.style'

import type {SubTranslation} from '../../l10n/typeHelpers'

const getTranslations = (state) => state.trans.supportScreen

type Props = {
  translations: SubTranslation<typeof getTranslations>,
}

const SupportScreen = ({translations}: Props) => (
  <View style={styles.root}>
    <SettingsItem
      title={translations.faq.label}
      description={translations.faq.description}
      dstUrl={translations.faq.url}
    >
      <CopyIcon width={styles.icon.size} height={styles.icon.size} />
    </SettingsItem>

    <SettingsItem
      title={translations.report.label}
      description={translations.report.description}
      dstUrl={translations.report.url}
    >
      <CopyIcon width={styles.icon.size} height={styles.icon.size} />
    </SettingsItem>

  </View>
)

export default compose(
  connect((state) => ({
    translations: getTranslations(state),
  }))
)(SupportScreen)
