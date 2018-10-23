// @flow

import React from 'react'
import {compose} from 'redux'
import {connect} from 'react-redux'
import {View} from 'react-native'

import Screen from '../../components/Screen'
import {SETTINGS_ROUTES} from '../../RoutesList'
import SettingsItemWithNavigation from './SettingsItemWithNavigation'
import SettingsLabelWithNavigation from './SettingsLabelWithNavigation'

import styles from './styles/SettingsScreen.style'

import type {SubTranslation} from '../../l10n/typeHelpers'

const getTranslations = (state) => state.trans.settings


type Props = {
  translations: SubTranslation<typeof getTranslations>,
};

const SettingsScreen = ({translations}: Props) => (
  <View style={styles.root}>
    <Screen scroll>
      <SettingsItemWithNavigation
        label={translations.walletName}
        description={'getWalletName()'}
        dstScreen={SETTINGS_ROUTES.CHANGE_WALLET_NAME}
      />

      <SettingsItemWithNavigation
        label={translations.privacy}
        description={translations.changePin}
        dstScreen={SETTINGS_ROUTES.CHANGE_WALLET_NAME}
      />

      <SettingsItemWithNavigation
        label={''}
        description={translations.changePassword}
        dstScreen={SETTINGS_ROUTES.CHANGE_WALLET_NAME}
      />

      <SettingsItemWithNavigation
        label={translations.downloadLogs}
        description={translations.downloadLogsText}
        dstScreen={SETTINGS_ROUTES.CHANGE_WALLET_NAME}
      />

      <SettingsLabelWithNavigation
        label={translations.removeWallet}
        dstScreen={SETTINGS_ROUTES.SUPPORT}
      />

      <SettingsItemWithNavigation
        label={translations.language}
        description={'getLanguage()'}
        dstScreen={SETTINGS_ROUTES.CHANGE_WALLET_NAME}
      />

      <SettingsLabelWithNavigation
        label={translations.termsOfUse}
        dstScreen={SETTINGS_ROUTES.SUPPORT}
      />

      <SettingsLabelWithNavigation
        label={translations.support}
        dstScreen={SETTINGS_ROUTES.SUPPORT}
      />
    </Screen>
  </View>
)

export default compose(
  connect((state) => ({
    translations: getTranslations(state),
  })),
)(SettingsScreen)
