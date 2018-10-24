// @flow

import React from 'react'
import {compose} from 'redux'
import {connect} from 'react-redux'
import {View} from 'react-native'

import Screen from '../../components/Screen'
import {SETTINGS_ROUTES} from '../../RoutesList'
import SettingsItem from './SettingsItem'
import SettingsLink from './SettingsLink'
import CopyIcon from '../../assets/CopyIcon'

import styles from './styles/SettingsScreen.style'

import type {SubTranslation} from '../../l10n/typeHelpers'

const getTranslations = (state) => state.trans.settings


type Props = {
  translations: SubTranslation<typeof getTranslations>,
};

const SettingsScreen = ({translations}: Props) => (
  <View style={styles.root}>
    <Screen scroll>
      <SettingsItem
        title={translations.walletName}
        description={'getWalletName()'}
        dstScreen={SETTINGS_ROUTES.CHANGE_WALLET_NAME}
      >
        <CopyIcon width={styles.icon.size} height={styles.icon.size} />
      </SettingsItem>

      <SettingsItem
        title={translations.privacy}
        description={translations.changePin}
        dstScreen={SETTINGS_ROUTES.CHANGE_WALLET_NAME}
      >
        <CopyIcon width={styles.icon.size} height={styles.icon.size} />
      </SettingsItem>

      <SettingsItem
        title={''}
        description={translations.changePassword}
        dstScreen={SETTINGS_ROUTES.CHANGE_WALLET_NAME}
      >
        <CopyIcon width={styles.icon.size} height={styles.icon.size} />
      </SettingsItem>


      <SettingsItem
        title={translations.downloadLogs}
        description={translations.downloadLogsText}
        dstScreen={SETTINGS_ROUTES.CHANGE_WALLET_NAME}
      >
        <CopyIcon width={styles.icon.size} height={styles.icon.size} />
      </SettingsItem>


      <SettingsLink
        text={translations.removeWallet}
        dstScreen={SETTINGS_ROUTES.SUPPORT}
      />

      <SettingsItem
        title={translations.language}
        description={'getLanguage()'}
        dstScreen={SETTINGS_ROUTES.CHANGE_WALLET_NAME}
      >
        <CopyIcon width={styles.icon.size} height={styles.icon.size} />
      </SettingsItem>


      <SettingsLink
        text={translations.termsOfUse}
        dstScreen={SETTINGS_ROUTES.SUPPORT}
      />

      <SettingsLink
        text={translations.support}
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
