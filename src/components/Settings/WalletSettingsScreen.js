// @flow
import React from 'react'
import {compose} from 'redux'
import {withState, withHandlers} from 'recompose'
import {View} from 'react-native'

import Screen from '../../components/Screen'
import {SETTINGS_ROUTES} from '../../RoutesList'
import {withNavigationTitle, withTranslations} from '../../utils/renderUtils'
import {
  ItemToggle,
  SettingsItem,
  NavigatedSettingsItem,
  SettingsSection,
} from './SettingsItems'

import styles from './styles/SettingsScreen.style'
import type {SubTranslation} from '../../l10n/typeHelpers'

const getTranslations = (state) => state.trans.SettingsScreen

type Props = {
  isEasyConfirmation: boolean,
  onToggleEasyConfirmation: () => void,
  translations: SubTranslation<typeof getTranslations>,
}

const WalletSettingsScreen = ({
  isEasyConfirmation,
  onToggleEasyConfirmation,
  translations,
}: Props) => (
  <Screen scroll>
    <View style={styles.root}>
      <View style={styles.tab}>
        <SettingsSection title={translations.walletName}>
          <NavigatedSettingsItem
            label={'getWalletName()'}
            navigateTo={SETTINGS_ROUTES.CHANGE_WALLET_NAME}
          />
        </SettingsSection>

        <SettingsSection title={translations.privacy}>
          <NavigatedSettingsItem
            label={translations.changePassword}
            navigateTo={SETTINGS_ROUTES.CHANGE_WALLET_NAME}
          />

          <SettingsItem description={translations.easyConfirmation}>
            <ItemToggle
              value={isEasyConfirmation}
              onToggle={onToggleEasyConfirmation}
            />
          </SettingsItem>
        </SettingsSection>

        <SettingsSection>
          <NavigatedSettingsItem
            label={translations.removeWallet}
            navigateTo={SETTINGS_ROUTES.SUPPORT}
          />
        </SettingsSection>
      </View>
    </View>
  </Screen>
)

export default compose(
  withTranslations(getTranslations),
  withNavigationTitle(({translations}) => translations.title),
  withState('isEasyConfirmation', 'setEasyConfirmation', false),
  withHandlers({
    onToggleEasyConfirmation: ({
      isEasyConfirmation,
      setEasyConfirmation,
    }) => () => setEasyConfirmation(!isEasyConfirmation),
  }),
)(WalletSettingsScreen)
