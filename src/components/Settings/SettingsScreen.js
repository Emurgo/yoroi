// @flow

import React from 'react'
import {compose} from 'redux'
import {connect} from 'react-redux'
import {withState, withHandlers} from 'recompose'
import {View, Switch} from 'react-native'

import Screen from '../../components/Screen'
import {SETTINGS_ROUTES} from '../../RoutesList'
import SettingsItem from './SettingsItem'
import SettingsLink from './SettingsLink'
import CopyIcon from '../../assets/CopyIcon'
import {Text} from '../UiKit'
import {withNavigationTitle} from '../../utils/renderUtils'

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
          dstScreen={SETTINGS_ROUTES.CHANGE_WALLET_NAME}
        >
          <Text style={styles.linkLabel}>{translations.edit}</Text>
        </SettingsItem>

        <SettingsItem
          title={translations.privacy}
          description={translations.changePin}
          dstScreen={SETTINGS_ROUTES.CHANGE_WALLET_NAME}
        >
          <CopyIcon width={styles.icon.size} height={styles.icon.size} />
        </SettingsItem>

        <SettingsItem
          description={translations.changePassword}
          dstScreen={SETTINGS_ROUTES.CHANGE_WALLET_NAME}
        >
          <CopyIcon width={styles.icon.size} height={styles.icon.size} />
        </SettingsItem>

        <SettingsItem description={translations.fingerprintSignIn}>
          <Switch
            value={isFingerprintSignIn}
            onValueChange={onToggleFingerprintSignIn}
          />
        </SettingsItem>

        <SettingsItem description={translations.easyConfirmation}>
          <Switch
            value={isEasyConfirmation}
            onValueChange={onToggleEasyConfirmation}
          />
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
      </View>

      <View style={styles.tab}>
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
