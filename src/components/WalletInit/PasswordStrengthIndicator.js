// @flow

import React from 'react'
import {View} from 'react-native'
import {compose} from 'redux'
import {withProps} from 'recompose'
import {injectIntl, defineMessages, type IntlShape} from 'react-intl'

import {getPasswordStrength} from '../../utils/validators'
import {Text} from '../UiKit'
import CheckIcon from '../../assets/CheckIcon'

import styles from './styles/PasswordStrengthIndicator.style'
import {COLORS} from '../../styles/config'

const messages = defineMessages({
  passwordRequirementsNote: {
    id:
      'components.walletinit.passwordstrengthindicator.passwordRequirementsNote',
    defaultMessage: '!!!The password needs to contain at least:',
    description: 'some desc',
  },
  passwordBigLength: {
    id: 'components.walletinit.passwordstrengthindicator.passwordBigLength',
    defaultMessage: '!!!10 characters',
    description: 'some desc',
  },
})

type ValidationCheckIconProps = {|
  isSatisfied?: boolean,
  label: string,
|}

const ValidationCheckIcon = ({
  isSatisfied,
  label,
}: ValidationCheckIconProps) => {
  const iconColor =
    isSatisfied === true ? COLORS.LIGHT_POSITIVE_GREEN : COLORS.SECONDARY_TEXT
  return (
    <View style={styles.row}>
      <CheckIcon width={16} height={16} color={iconColor} />
      <Text style={[styles.label, {color: iconColor}]}>{label}</Text>
    </View>
  )
}

type Props = {|
  intl: IntlShape,
  satisfiesPasswordRequirement?: boolean,
|}

const LongPasswordStrengthIndicator = injectIntl(
  ({satisfiesPasswordRequirement, intl}: Props) => (
    <View>
      <Text>{intl.formatMessage(messages.passwordRequirementsNote)}</Text>

      <View style={styles.container}>
        <ValidationCheckIcon
          isSatisfied={satisfiesPasswordRequirement}
          label={intl.formatMessage(messages.passwordBigLength)}
        />
      </View>
    </View>
  ),
)

export default injectIntl(
  compose(withProps(({password}) => getPasswordStrength(password)))(
    LongPasswordStrengthIndicator,
  ),
)
