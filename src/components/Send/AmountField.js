// @flow

import React from 'react'
import {compose} from 'redux'
import {withHandlers} from 'recompose'
import {injectIntl, defineMessages, intlShape} from 'react-intl'

import {pastedFormatter, editedFormatter} from './amountUtils'
import {ValidatedTextInput} from '../UiKit'

import type {ComponentType} from 'react'

export const messages = defineMessages({
  label: {
    id: 'components.send.amountfield.label',
    defaultMessage: '!!!Amount',
    description: 'some desc',
  },
})

const handleSetAmount = ({setAmount, amount}) => (text) => {
  const shorterStringLength = Math.min(text.length, amount.length)
  const wasPasted =
    Math.abs(amount.length - text.length) > 1 ||
    amount.substring(0, shorterStringLength) !==
      text.substring(0, shorterStringLength)

  const formatter = wasPasted ? pastedFormatter : editedFormatter

  setAmount(formatter(text))
}

const AmountField = ({amount, handleSetAmount, intl, error}) => (
  <ValidatedTextInput
    returnKeyType="done"
    keyboardType="numeric"
    label={intl.formatMessage(messages.label)}
    value={amount}
    onChangeText={handleSetAmount}
    error={error}
  />
)

type ExternalProps = {
  amount: string,
  setAmount: (amount: string) => mixed,
  error: ?string,
  intl: intlShape,
}

export default injectIntl(
  (compose(
    withHandlers({
      handleSetAmount,
    }),
  )(AmountField): ComponentType<ExternalProps>),
)
