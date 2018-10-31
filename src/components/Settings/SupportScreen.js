// @flow

import React from 'react'
import {connect} from 'react-redux'
import {compose} from 'redux'
import {View} from 'react-native'

import {SettingsItem, ItemIcon, LinkTo} from './SettingsItems'
import {withNavigationTitle} from '../../utils/renderUtils'

import styles from './styles/SupportScreen.style'

import type {SubTranslation} from '../../l10n/typeHelpers'

const getTranslations = (state) => state.trans.SupportScreen

type Props = {
  translations: SubTranslation<typeof getTranslations>,
}

const SupportScreen = ({translations}: Props) => (
  <View style={styles.root}>
    <SettingsItem
      title={translations.faq.label}
      description={translations.faq.description}
    >
      <LinkTo url={translations.faq.url}>
        <ItemIcon />
      </LinkTo>
    </SettingsItem>

    <SettingsItem
      title={translations.report.label}
      description={translations.report.description}
    >
      <LinkTo url={translations.report.url}>
        <ItemIcon />
      </LinkTo>
    </SettingsItem>
  </View>
)

export default compose(
  connect((state) => ({
    translations: getTranslations(state),
  })),
  withNavigationTitle(({translations}) => translations.title),
)(SupportScreen)
