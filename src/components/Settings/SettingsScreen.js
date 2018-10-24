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

import styles from './styles/SettingsScreen.style'

import type {SubTranslation} from '../../l10n/typeHelpers'

const getTranslations = (state) => state.trans.settings

type Props = {
  isFingerprintSignIn: boolean,
  setFingerprintSignIn: (boolean) => void,
  onChangeFingerprintSignIn: () => void,
  isEasyConfirmation: boolean,
  setEasyConfirmation: (boolean) => void,
  onChangeEasyConfirmation: () => void,
  translations: SubTranslation<typeof getTranslations>,
};

const SettingsScreen = ({
  isFingerprintSignIn,
  setFingerprintSignIn,
  onChangeFingerprintSignIn,
  isEasyConfirmation,
  setEasyConfirmation,
  onChangeEasyConfirmation,
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
          title={''}
          description={translations.changePassword}
          dstScreen={SETTINGS_ROUTES.CHANGE_WALLET_NAME}
        >
          <CopyIcon width={styles.icon.size} height={styles.icon.size} />
        </SettingsItem>

        <SettingsItem
          title={''}
          description={translations.fingerprintSignIn}
        >
          <Switch
            value={isFingerprintSignIn}
            onValueChange={onChangeFingerprintSignIn}
          />
        </SettingsItem>

        <SettingsItem
          title={''}
          description={translations.easyConfirmation}
        >
          <Switch
            value={isEasyConfirmation}
            onValueChange={onChangeEasyConfirmation}
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
  withState('isFingerprintSignIn', 'setFingerprintSignIn', false),
  withState('isEasyConfirmation', 'setEasyConfirmation', false),
  withHandlers({
    onChangeFingerprintSignIn: ({isFingerprintSignIn, setFingerprintSignIn}) =>
      () => (setFingerprintSignIn(!isFingerprintSignIn)),
    onChangeEasyConfirmation: ({isEasyConfirmation, setEasyConfirmation}) =>
      () => (setEasyConfirmation(!isEasyConfirmation)),
  }),
)(SettingsScreen)
