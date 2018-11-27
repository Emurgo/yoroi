// @flow

import React from 'react'
import {compose} from 'redux'
import {connect} from 'react-redux'
import {withHandlers} from 'recompose'

import {WALLET_INIT_ROUTES} from '../../../RoutesList'
import {withNavigationTitle} from '../../../utils/renderUtils'
import WalletForm from '../WalletForm'

import type {State} from '../../../state'
import type {SubTranslation} from '../../../l10n/typeHelpers'

const getTranslations = (state: State) =>
  state.trans.CreateOrRestoreWalletScreen

const handleCreate = ({navigation}) => ({name, password}) => {
  navigation.navigate(WALLET_INIT_ROUTES.RECOVERY_PHRASE_DIALOG, {
    name,
    password,
  })
}

type Props = {
  handleCreate: ({name: string, password: string}) => mixed,
  translations: SubTranslation<typeof getTranslations>,
}

const CreateWalletScreen = ({handleCreate}: Props) => (
  <WalletForm onSubmit={handleCreate} />
)

export default compose(
  connect((state) => ({
    translations: getTranslations(state),
  })),
  withNavigationTitle(({translations}) => translations.title),
  withHandlers({
    handleCreate,
  }),
)(CreateWalletScreen)
