// @flow

import React from 'react'
import {connect} from 'react-redux'
import {compose} from 'redux'
import {SafeAreaView} from 'react-navigation'
import {withState, withHandlers} from 'recompose'
import {ScrollView} from 'react-native'

import TermsOfService from '../Common/TermsOfService'
import {withNavigationTitle} from '../../utils/renderUtils'
import {Checkbox, Button} from '../UiKit'
import {FIRST_RUN_ROUTES, WALLET_INIT_ROUTES} from '../../RoutesList'
import {systemAuthSupportSelector} from '../../selectors'

import styles from './styles/AcceptTermsOfServiceScreen.styles'

import type {SubTranslation} from '../../l10n/typeHelpers'

const getTranslations = (state) => state.trans.TermsOfServiceScreen

type Props = {
  translations: SubTranslation<typeof getTranslations>,
  acceptedTos: boolean,
  setAcceptedTos: (accepted: boolean) => mixed,
  handleAccepted: () => mixed,
}

const AcceptTermsOfServiceScreen = ({
  translations,
  acceptedTos,
  setAcceptedTos,
  handleAccepted,
}: Props) => (
  <SafeAreaView style={styles.safeAreaView}>
    <ScrollView>
      <TermsOfService />
    </ScrollView>

    <Checkbox
      style={styles.checkbox}
      checked={acceptedTos}
      text={translations.aggreeClause}
      onChange={setAcceptedTos}
    />
    <Button
      onPress={handleAccepted}
      disabled={!acceptedTos}
      title={translations.continue}
    />
  </SafeAreaView>
)

export default compose(
  connect((state) => ({
    translations: getTranslations(state),
    isSystemAuthEnabled: systemAuthSupportSelector(state),
  })),
  withState('acceptedTos', 'setAcceptedTos', false),
  withHandlers({
    handleAccepted: ({navigation, isSystemAuthEnabled}) => () => {
      if (isSystemAuthEnabled) {
        navigation.navigate(WALLET_INIT_ROUTES.MAIN)
      } else {
        navigation.navigate(FIRST_RUN_ROUTES.CUSTOM_PIN)
      }
    },
  }),
  withNavigationTitle(({translations}) => translations.title),
)(AcceptTermsOfServiceScreen)
