// @flow

import React from 'react'
import {compose} from 'redux'
import {connect} from 'react-redux'
import {withState, withHandlers} from 'recompose'
import {View} from 'react-native'

import Screen from '../../components/Screen'
import {SETTINGS_ROUTES} from '../../RoutesList'
import {withNavigationTitle} from '../../utils/renderUtils'
// eslint-disable-next-line max-len
import {NavigationWrapper, ItemLink, ItemIcon, ItemToggle, SettingsItem, SettingsLink} from './SettingsItems'

import styles from './styles/SettingsScreen.style'

import type {SubTranslation} from '../../l10n/typeHelpers'

const getTranslations = (state) => state.trans.settingsScreen

type Props = {
  isFingerprintSignIn: boolean,
  onToggleFingerprintSignIn: () => void,
  isEasyConfirmation: boolean,
  onToggleEasyConfirmation: () => void,
  translations: SubTranslation<typeof getTranslations>,
};

const SettingsScreen = ({
  isFingerprintSignIn,
  onToggleFingerprintSignIn,
  isEasyConfirmation,
  onToggleEasyConfirmation,
  translations,
}: Props) => (
  <View style={styles.root}>
    <Screen scroll>
      <View style={styles.tab}>
        <SettingsItem
          title={translations.walletName}
          description={'getWalletName()'}
        >
          <NavigationWrapper dstScreen={SETTINGS_ROUTES.CHANGE_WALLET_NAME}>
            <ItemLink label={translations.edit} />
          </NavigationWrapper>
        </SettingsItem>

        <SettingsItem
          title={translations.privacy}
          description={translations.changePin}
        >
          <NavigationWrapper dstScreen={SETTINGS_ROUTES.CHANGE_WALLET_NAME}>
            <ItemIcon />
          </NavigationWrapper>
        </SettingsItem>

        <SettingsItem description={translations.changePassword}>
          <NavigationWrapper dstScreen={SETTINGS_ROUTES.CHANGE_WALLET_NAME}>
            <ItemIcon />
          </NavigationWrapper>
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
          <NavigationWrapper dstScreen={SETTINGS_ROUTES.CHANGE_WALLET_NAME}>
            <ItemIcon />
          </NavigationWrapper>
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
          <NavigationWrapper dstScreen={SETTINGS_ROUTES.CHANGE_WALLET_NAME}>
            <ItemIcon />
          </NavigationWrapper>
        </SettingsItem>


        <SettingsLink
          label={translations.termsOfUse}
          dstScreen={SETTINGS_ROUTES.SUPPORT}
        />

        <SettingsLink
          label={translations.support}
          dstScreen={SETTINGS_ROUTES.SUPPORT}
        />
      </View>
    </Screen>
  </View>
)

export default compose(
  connect((state) => ({
    translations: getTranslations(state),
  })),
  withNavigationTitle(({translations}) => translations.title),
  withState('isFingerprintSignIn', 'setFingerprintSignIn', false),
  withState('isEasyConfirmation', 'setEasyConfirmation', false),
  withHandlers({
    onToggleFingerprintSignIn: ({isFingerprintSignIn, setFingerprintSignIn}) =>
      () => (setFingerprintSignIn(!isFingerprintSignIn)),
    onToggleEasyConfirmation: ({isEasyConfirmation, setEasyConfirmation}) =>
      () => (setEasyConfirmation(!isEasyConfirmation)),
  }),
)(SettingsScreen)
