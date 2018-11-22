// @flow

import React from 'react'
import {View} from 'react-native'
import {compose} from 'redux'
import {withProps} from 'recompose'

import {getPasswordStrength} from '../../utils/validators'
import {Text} from '../UiKit'
import CheckIcon from '../../assets/CheckIcon'
import {withTranslations} from '../../utils/renderUtils'

import styles from './styles/PasswordStrengthIndicator.style'
import {COLORS} from '../../styles/config'

import type {SubTranslation} from '../../l10n/typeHelpers'

const getTranslations = (state) => state.trans.PasswordStrengthIndicator

type ValidationCheckIconProps = {
  isSatisfied?: boolean,
  label: string,
}

const ValidationCheckIcon = ({
  isSatisfied,
  label,
}: ValidationCheckIconProps) => {
  const iconColor = isSatisfied ? COLORS.LIGHT_POSITIVE_GREEN : COLORS.BLACK
  return (
    <View style={styles.passwordRequirement}>
      <CheckIcon width={16} height={16} color={iconColor} />
      <Text style={styles.passwordRequirement}>{label}</Text>
    </View>
  )
}

type Props = {
  translations: SubTranslation<typeof getTranslations>,
  hasSevenCharacters?: boolean,
  hasUppercase?: boolean,
  hasLowercase?: boolean,
  hasDigit?: boolean,
  hasTwelveCharacters?: boolean,
}

const PasswordStrengthIndicator = ({
  translations,
  hasSevenCharacters,
  hasUppercase,
  hasLowercase,
  hasDigit,
  hasTwelveCharacters,
}: Props) => (
  <View>
    <Text>{translations.passwordRequirementsNote}</Text>

    <View style={styles.passwordRequirementsRow}>
      <ValidationCheckIcon
        isSatisfied={hasSevenCharacters}
        label={translations.passwordMinLength}
      />
      <ValidationCheckIcon
        isSatisfied={hasLowercase}
        label={translations.passwordLowerChar}
      />
    </View>

    <View style={styles.passwordRequirementsRow}>
      <ValidationCheckIcon
        isSatisfied={hasUppercase}
        label={translations.passwordUpperChar}
      />
      <ValidationCheckIcon
        isSatisfied={hasDigit}
        label={translations.passwordNumber}
      />
    </View>

    <Text>{translations.or}</Text>

    <View style={styles.passwordRequirementsRow}>
      <ValidationCheckIcon
        isSatisfied={hasTwelveCharacters}
        label={translations.passwordBigLength}
      />
    </View>
  </View>
)

export default compose(
  withTranslations(getTranslations),
  withProps(({password}) => getPasswordStrength(password)),
)(PasswordStrengthIndicator)
