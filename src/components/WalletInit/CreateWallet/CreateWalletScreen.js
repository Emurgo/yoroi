// @flow

import React from 'react'
import {TextInput, View, TouchableHighlight} from 'react-native'
import {compose} from 'redux'
import {connect} from 'react-redux'
import {withHandlers, withState} from 'recompose'

import CheckIcon from '../../../assets/CheckIcon'
import CustomText from '../../CustomText'
import Screen from '../../Screen'
import {WALLET_INIT_ROUTES} from '../../../RoutesList'
import {generateAdaMnemonic, generateWalletMasterKey} from '../../../crypto/wallet'

import styles from './styles/CreateWalletScreen.style'
import {COLORS} from '../../../styles/config'

import type {State} from '../../../state'
import type {SubTranslation} from '../../../l10n/typeHelpers'

const getTrans = (state: State) => state.trans.createWallet

const handleCreate = ({navigation}) => () => {
  const mnemonic = generateAdaMnemonic()
  generateWalletMasterKey(mnemonic, '')
  navigation.navigate(WALLET_INIT_ROUTES.RECOVERY_PHRASE_DIALOG, {mnemonic})
}

type Props = {
  handleCreate: () => mixed,
  trans: SubTranslation<typeof getTrans>,
  name: string,
  password: string,
  passwordConfirmation: string,
  setName: (string, ?Function) => void,
  setPassword: (string, ?Function) => void,
  setPasswordConfirmation: (string, ?Function) => void,
}

const CreateWalletScreen = ({
  handleCreate,
  trans,
  name,
  password,
  passwordConfirmation,
  setName,
  setPassword,
  setPasswordConfirmation,
}: Props) => (
  <Screen bgColor={COLORS.TRANSPARENT}>
    <View style={styles.container}>
      <View>
        <CustomText style={styles.formLabel}>{trans.nameLabel}</CustomText>
        <TextInput style={styles.input} onChangeText={setName} value={name} autoFocus />
      </View>
      <View>
        <CustomText style={styles.formLabel}>{trans.passwordLabel}</CustomText>
        <TextInput
          secureTextEntry
          style={styles.input}
          onChangeText={setPassword}
          value={password}
        />
      </View>
      <View>
        <CustomText style={styles.formLabel}>{trans.passwordConfirmationLabel}</CustomText>
        <TextInput
          secureTextEntry
          style={styles.input}
          onChangeText={setPasswordConfirmation}
          value={passwordConfirmation}
        />
      </View>
      <View>
        <CustomText>{trans.passwordRequirementsNote}</CustomText>
        <View style={styles.passwordRequirementsRow}>
          <View style={styles.passwordRequirement}>
            <CheckIcon width={16} height={16} />
            <CustomText style={styles.passwordRequirement}>{trans.passwordMinLength}</CustomText>
          </View>
          <View style={styles.passwordRequirement}>
            <CheckIcon width={16} height={16} />
            <CustomText style={styles.passwordRequirement}>{trans.passwordLowerChar}</CustomText>
          </View>
        </View>
        <View style={styles.passwordRequirementsRow}>
          <View style={styles.passwordRequirement}>
            <CheckIcon width={16} height={16} />
            <CustomText style={styles.passwordRequirement}>{trans.passwordUpperChar}</CustomText>
          </View>
          <View style={styles.passwordRequirement}>
            <CheckIcon width={16} height={16} />
            <CustomText style={styles.passwordRequirement}>{trans.passwordNumber}</CustomText>
          </View>
        </View>
      </View>

      <TouchableHighlight
        activeOpacity={0.1}
        underlayColor={COLORS.WHITE}
        onPress={handleCreate}
        style={styles.button}
      >
        <CustomText style={styles.buttonText}>{trans.createButton}</CustomText>
      </TouchableHighlight>
    </View>
  </Screen>
)

export default compose(
  connect((state) => ({
    trans: getTrans(state),
  })),
  withState('name', 'setName', ''),
  withState('password', 'setPassword', ''),
  withState('passwordConfirmation', 'setPasswordConfirmation', ''),
  withHandlers({
    handleCreate,
  })
)(CreateWalletScreen)
