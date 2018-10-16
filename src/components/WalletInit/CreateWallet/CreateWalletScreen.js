// @flow

import React from 'react'
import {TextInput, View, TouchableHighlight} from 'react-native'
import {compose} from 'redux'
import {connect} from 'react-redux'
import {NavigationEvents} from 'react-navigation'
import {withHandlers, withState} from 'recompose'

import CheckIcon from '../../../assets/CheckIcon'
import CustomText from '../../CustomText'
import Screen from '../../Screen'
import {validatePassword} from '../../../utils/validators'
import {WALLET_INIT_ROUTES} from '../../../RoutesList'

import styles from './styles/CreateWalletScreen.style'
import {COLORS} from '../../../styles/config'

import type {PasswordValidationErrors} from '../../../utils/validators'
import type {State} from '../../../state'
import type {SubTranslation} from '../../../l10n/typeHelpers'

type FormValidationErrors = PasswordValidationErrors & {nameReq?: boolean}

const getTrans = (state: State) => state.trans.createWallet

const handleCreate = ({navigation}) => () => {
  navigation.navigate(WALLET_INIT_ROUTES.RECOVERY_PHRASE_DIALOG)
}

const validateForm = ({name, password, passwordConfirmation}): FormValidationErrors | null => {
  const nameErrors = name !== '' ? null : {nameReq: true}
  const passwordErrors = validatePassword(password, passwordConfirmation)

  return nameErrors || passwordErrors ? {...nameErrors, ...passwordErrors} : null
}

const handleOnWillBlur = ({setPassword, setPasswordConfirmation}) => () => {
  setPassword('')
  setPasswordConfirmation('')
}

type Props = {
  handleCreate: () => mixed,
  trans: SubTranslation<typeof getTrans>,
  name: string,
  password: string,
  passwordConfirmation: string,
  setName: (string) => mixed,
  setPassword: (string) => mixed,
  setPasswordConfirmation: (string) => mixed,
  onWillBlur: () => void,
  validateForm: () => FormValidationErrors | null,
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
  validateForm,
  onWillBlur,
}: Props) => {
  const errors = validateForm()

  return (
    <Screen bgColor={COLORS.TRANSPARENT} scroll>
      <NavigationEvents onWillBlur={onWillBlur} />
      <View style={styles.container}>
        <View>
          <CustomText style={styles.formLabel}>{trans.nameLabel}</CustomText>
          <View style={styles.inputRow}>
            <TextInput style={styles.input} onChangeText={setName} value={name} autoFocus />
            <CheckIcon
              width={25}
              height={25}
              color={errors && errors.nameReq ? COLORS.TRANSPARENT : COLORS.LIGHT_POSITIVE_GREEN}
            />
          </View>
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
          <View style={styles.inputRow}>
            <TextInput
              secureTextEntry
              style={styles.input}
              onChangeText={setPasswordConfirmation}
              value={passwordConfirmation}
            />
            <CheckIcon
              width={25}
              height={25}
              color={
                errors && (errors.passwordConfirmationReq || errors.matchesConfirmation)
                  ? COLORS.TRANSPARENT
                  : COLORS.LIGHT_POSITIVE_GREEN
              }
            />
          </View>
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
          disabled={!!errors}
          underlayColor={COLORS.WHITE}
          onPress={handleCreate}
          style={[styles.button, errors == null ? {} : styles.disabledButton]}
        >
          <CustomText style={styles.buttonText}>{trans.createButton}</CustomText>
        </TouchableHighlight>
      </View>
    </Screen>
  )
}

export default compose(
  connect((state) => ({
    trans: getTrans(state),
  })),
  withState('name', 'setName', ''),
  withState('password', 'setPassword', ''),
  withState('passwordConfirmation', 'setPasswordConfirmation', ''),
  withHandlers({
    handleCreate,
    validateForm: ({name, password, passwordConfirmation}) => () =>
      validateForm({name, password, passwordConfirmation}),
    onWillBlur: handleOnWillBlur,
  })
)(CreateWalletScreen)
