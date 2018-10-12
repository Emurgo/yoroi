// @flow

import React from 'react'
import {View, TouchableHighlight} from 'react-native'
import {compose} from 'redux'
import {connect} from 'react-redux'
import {withHandlers} from 'recompose'

import CustomText from '../../CustomText'
import Screen from '../../Screen'
import {WALLET_INIT_ROUTES} from '../../../RoutesList'
import {generateAdaMnemonic, generateWalletMasterKey} from '../../../crypto/wallet'

import styles from './styles/CreateWalletScreen.style'
import {COLORS} from '../../../styles/config'

import type {State} from '../../../state'
import type {SubTranslation} from '../../../l10n/typeHelpers'


const getTrans = (state: State) => state.trans.createWallet

type Props = {
  handleCreate: () => mixed,
  trans: SubTranslation<typeof getTrans>,
};

const handleCreate = ({navigation}) => () => {
  const mnemonic = generateAdaMnemonic()
  generateWalletMasterKey(mnemonic, '')
  navigation.navigate(WALLET_INIT_ROUTES.RECOVERY_PHRASE_DIALOG, {mnemonic})
}

const CreateWalletScreen = ({handleCreate, trans}: Props) => (
  <Screen bgColor={COLORS.TRANSPARENT}>
    <View>
      <CustomText>{trans.title}</CustomText>
      <CustomText>{trans.nameLabel}</CustomText>
      <CustomText>{trans.passwordLabel}</CustomText>
      <CustomText>{trans.passwordConfirmationLabel}</CustomText>
      <CustomText>{trans.passwordRequirementsNote}</CustomText>

      <TouchableHighlight
        activeOpacity={0.1}
        underlayColor={COLORS.WHITE}
        onPress={handleCreate}
        style={styles.button}
      >
        <CustomText>{trans.createButton}</CustomText>
      </TouchableHighlight>
    </View>
  </Screen>
)

export default compose(
  connect((state) => ({
    trans: getTrans(state),
  })),
  withHandlers({
    handleCreate,
  })
)(CreateWalletScreen)
