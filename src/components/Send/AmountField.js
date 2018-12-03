// @flow

import React from 'react'
import {compose} from 'redux'
import {withHandlers} from 'recompose'

import {pastedFormatter, editedFormatter} from './amountUtils'
import {withTranslations} from '../../utils/renderUtils'
import {ValidatedTextInput} from '../UiKit'

import type {ComponentType} from 'react'

const getTranslations = (state) => state.trans.SendAdaScreen.amountInput

const handleSetAmount = ({setAmount, amount}) => (text) => {
  const shorterStringLength = Math.min(text.length, amount.length)
  const wasPasted =
    Math.abs(amount.length - text.length) > 1 ||
    amount.substring(0, shorterStringLength) !==
      text.substring(0, shorterStringLength)

  const formatter = wasPasted ? pastedFormatter : editedFormatter

  setAmount(formatter(text))
}

const AmountField = ({amount, handleSetAmount, translations, error}) => (
  <ValidatedTextInput
    returnKeyType="done"
    keyboardType="numeric"
    label={translations.label}
    value={amount}
    onChangeText={handleSetAmount}
    error={error}
  />
)

type ExternalProps = {
  amount: string,
  setAmount: (amount: string) => mixed,
  error: ?string,
}

export default (compose(
  withTranslations(getTranslations),
  withHandlers({
    handleSetAmount,
  }),
)(AmountField): ComponentType<ExternalProps>)
