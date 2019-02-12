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
  const iconColor = isSatisfied ? COLORS.LIGHT_POSITIVE_GREEN : '#ADAEB6'
  return (
    <View style={styles.row}>
      <CheckIcon width={16} height={16} color={iconColor} />
      <Text style={[styles.label, {color: iconColor}]}>{label}</Text>
    </View>
  )
}

type Props = {
  translations: SubTranslation<typeof getTranslations>,
  hasTwelveCharacters?: boolean,
}

const LongPasswordStrengthIndicator = ({
  hasTwelveCharacters,
  translations,
}: Props) => (
  <View>
    <Text>{translations.passwordRequirementsNote}</Text>

    <View style={styles.container}>
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
)(LongPasswordStrengthIndicator)
