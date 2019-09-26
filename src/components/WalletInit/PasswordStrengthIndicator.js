// @flow

import React from 'react'
import {View} from 'react-native'
import {compose} from 'redux'
import {withProps} from 'recompose'
import {injectIntl, defineMessages} from 'react-intl'

import {getPasswordStrength} from '../../utils/validators'
import {Text} from '../UiKit'
import CheckIcon from '../../assets/CheckIcon'
import {CONFIG} from '../../config'

import styles from './styles/PasswordStrengthIndicator.style'
import {COLORS} from '../../styles/config'

const messages = defineMessages({
  passwordRequirementsNote: {
    id:
      'components.walletinit.passwordstrengthindicator.passwordRequirementsNote',
    defaultMessage: '!!!The password needs to contain at least:',
    description: 'some desc',
  },
  passwordMinLength: {
    id: 'components.walletinit.passwordstrengthindicator.passwordMinLength',
    defaultMessage: '!!!7 characters',
    description: 'some desc',
  },
  passwordUpperChar: {
    id: 'components.walletinit.passwordstrengthindicator.passwordUpperChar',
    defaultMessage: '!!!1 uppercase letter',
    description: 'some desc',
  },
  passwordLowerChar: {
    id: 'components.walletinit.passwordstrengthindicator.passwordLowerChar',
    defaultMessage: '!!!1 lowercase letter',
    description: 'some desc',
  },
  passwordNumber: {
    id: 'components.walletinit.passwordstrengthindicator.passwordNumber',
    defaultMessage: '!!!1 number',
    description: 'some desc',
  },
  continueButton: {
    id: 'components.walletinit.passwordstrengthindicator.continueButton',
    defaultMessage: '!!!Continue',
    description: 'some desc',
  },
  passwordBigLength: {
    id: 'components.walletinit.passwordstrengthindicator.passwordBigLength',
    defaultMessage: '!!!12 characters',
    description: 'some desc',
  },
  or: {
    id: 'components.walletinit.passwordstrengthindicator.or',
    defaultMessage: '!!!Or',
    description: 'some desc',
  },
})

type ValidationCheckIconProps = {
  isSatisfied?: boolean,
  hasSevenCharacters?: boolean,
  label: string,
}

const ValidationCheckIcon = ({
  isSatisfied,
  label,
}: ValidationCheckIconProps) => {
  const iconColor = isSatisfied === true ? COLORS.LIGHT_POSITIVE_GREEN : '#ADAEB6'
  return (
    <View style={styles.row}>
      <CheckIcon width={16} height={16} color={iconColor} />
      <Text style={[styles.label, {color: iconColor}]}>{label}</Text>
    </View>
  )
}

type Props = {
  intl: any,
  hasUppercase?: boolean,
  hasSevenCharacters?: boolean,
  hasLowercase?: boolean,
  hasDigit?: boolean,
  hasTwelveCharacters?: boolean,
}

const LongPasswordStrengthIndicator = injectIntl(
  ({hasTwelveCharacters, intl}: Props) => (
    <View>
      <Text>{intl.formatMessage(messages.passwordRequirementsNote)}</Text>

      <View style={styles.container}>
        <ValidationCheckIcon
          isSatisfied={hasTwelveCharacters}
          label={intl.formatMessage(messages.passwordBigLength)}
        />
      </View>
    </View>
  ),
)

const CombinedPasswordStrengthIndicator = ({
  intl,
  hasSevenCharacters,
  hasUppercase,
  hasLowercase,
  hasDigit,
  hasTwelveCharacters,
}: Props) => (
  <View style={styles.container}>
    <Text secondary>
      {intl.formatMessage(messages.passwordRequirementsNote)}
    </Text>

    <ValidationCheckIcon
      isSatisfied={hasSevenCharacters}
      label={intl.formatMessage(messages.passwordMinLength)}
    />
    <ValidationCheckIcon
      isSatisfied={hasLowercase}
      label={intl.formatMessage(messages.passwordLowerChar)}
    />
    <ValidationCheckIcon
      isSatisfied={hasUppercase}
      label={intl.formatMessage(messages.passwordUpperChar)}
    />
    <ValidationCheckIcon
      isSatisfied={hasDigit}
      label={intl.formatMessage(messages.passwordNumber)}
    />

    <Text secondary>{intl.formatMessage(messages.or)}</Text>

    <ValidationCheckIcon
      isSatisfied={hasTwelveCharacters}
      label={intl.formatMessage(messages.passwordBigLength)}
    />
  </View>
)

const indicator = CONFIG.ALLOW_SHORT_PASSWORD
  ? CombinedPasswordStrengthIndicator
  : LongPasswordStrengthIndicator

export default injectIntl(
  compose(withProps(({password}) => getPasswordStrength(password)))(indicator),
)
