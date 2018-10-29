// @flow

import React from 'react'
import {connect} from 'react-redux'
import {compose} from 'redux'
import {View} from 'react-native'

import {SettingsItem, ItemIcon, UrlWrapper} from './SettingsItems'
import {withNavigationTitle} from '../../utils/renderUtils'

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
    >
      <UrlWrapper dstUrl={translations.faq.url}>
        <ItemIcon />
      </UrlWrapper>
    </SettingsItem>

    <SettingsItem
      title={translations.report.label}
      description={translations.report.description}
    >
      <UrlWrapper dstUrl={translations.report.url}>
        <ItemIcon />
      </UrlWrapper>
    </SettingsItem>

  </View>
)

export default compose(
  connect((state) => ({
    translations: getTranslations(state),
  })),
  withNavigationTitle(({translations}) => translations.title),
)(SupportScreen)
