// @flow

import React from 'react'
import {compose} from 'redux'
import {connect} from 'react-redux'
import {withState, withHandlers} from 'recompose'
import {View} from 'react-native'

import Screen from '../../components/Screen'
import {SETTINGS_ROUTES} from '../../RoutesList'
import {withNavigationTitle} from '../../utils/renderUtils'
import {
  NavigateTo,
  ItemLink,
  ItemIcon,
  ItemToggle,
  SettingsItem,
  SettingsLink,
} from './SettingsItems'

import styles from './styles/SettingsScreen.style'

import type {SubTranslation} from '../../l10n/typeHelpers'

const getTranslations = (state) => state.trans.SettingsScreen

type Props = {
  isFingerprintSignIn: boolean,
  onToggleFingerprintSignIn: () => void,
  isEasyConfirmation: boolean,
  onToggleEasyConfirmation: () => void,
  translations: SubTranslation<typeof getTranslations>,
}

const SettingsScreen = ({
  isFingerprintSignIn,
  onToggleFingerprintSignIn,
  isEasyConfirmation,
  onToggleEasyConfirmation,
  translations,
}: Props) => (
  <Screen scroll>
    <View style={styles.root}>
      <View style={styles.tab}>
        <SettingsItem
          title={translations.walletName}
          description={'getWalletName()'}
        >
          <NavigateTo screen={SETTINGS_ROUTES.CHANGE_WALLET_NAME}>
            <ItemLink label={translations.edit} />
          </NavigateTo>
        </SettingsItem>

        <SettingsItem
          title={translations.privacy}
          description={translations.changePin}
        >
          <NavigateTo screen={SETTINGS_ROUTES.CHANGE_WALLET_NAME}>
            <ItemIcon />
          </NavigateTo>
        </SettingsItem>

        <SettingsItem description={translations.changePassword}>
          <NavigateTo screen={SETTINGS_ROUTES.CHANGE_WALLET_NAME}>
            <ItemIcon />
          </NavigateTo>
        </SettingsItem>

        <SettingsItem description={translations.fingerprintSignIn}>
          <ItemToggle
            value={isFingerprintSignIn}
            onToggle={onToggleFingerprintSignIn}
          />
        </SettingsItem>

        <SettingsItem description={translations.easyConfirmation}>
          <ItemToggle
            value={isEasyConfirmation}
            onToggle={onToggleEasyConfirmation}
          />
        </SettingsItem>

        <SettingsItem
          title={translations.downloadLogs}
          description={translations.downloadLogsText}
        >
          <NavigateTo screen={SETTINGS_ROUTES.CHANGE_WALLET_NAME}>
            <ItemIcon />
          </NavigateTo>
        </SettingsItem>

        <SettingsLink
          label={translations.removeWallet}
          dstScreen={SETTINGS_ROUTES.SUPPORT}
        />
      </View>

      <View style={styles.tab}>
        <SettingsItem
          title={translations.language}
          description={'getLanguage()'}
        >
          <NavigateTo screen={SETTINGS_ROUTES.CHANGE_WALLET_NAME}>
            <ItemIcon />
          </NavigateTo>
        </SettingsItem>

        <SettingsLink
          label={translations.termsOfUse}
          dstScreen={SETTINGS_ROUTES.TERMS_OF_USE}
        />

        <SettingsLink
          label={translations.support}
          dstScreen={SETTINGS_ROUTES.SUPPORT}
        />
      </View>
    </View>
  </Screen>
)

export default compose(
  connect((state) => ({
    translations: getTranslations(state),
  })),
  withNavigationTitle(({translations}) => translations.title),
  withState('isFingerprintSignIn', 'setFingerprintSignIn', false),
  withState('isEasyConfirmation', 'setEasyConfirmation', false),
  withHandlers({
    onToggleFingerprintSignIn: ({
      isFingerprintSignIn,
      setFingerprintSignIn,
    }) => () => setFingerprintSignIn(!isFingerprintSignIn),
    onToggleEasyConfirmation: ({
      isEasyConfirmation,
      setEasyConfirmation,
    }) => () => setEasyConfirmation(!isEasyConfirmation),
  }),
)(SettingsScreen)
