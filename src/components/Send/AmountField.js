// @flow

import React from 'react'
import {injectIntl, defineMessages, type IntlShape} from 'react-intl'

import {pastedFormatter, editedFormatter} from './amountUtils'
import {ValidatedTextInput} from '../UiKit'

export const messages = defineMessages({
  label: {
    id: 'components.send.amountfield.label',
    defaultMessage: '!!!Amount',
    description: 'some desc',
  },
})

type Props = {
  amount: string,
  setAmount: (amount: string) => mixed,
  error: ?string,
  editable?: boolean,
  intl: IntlShape,
}

const AmountField = ({amount, intl, error, editable, setAmount}: Props) => {
  const handleSetAmount = (text) => {
    const shorterStringLength = Math.min(text.length, amount.length)
    const wasPasted =
      Math.abs(amount.length - text.length) > 1 ||
      amount.substring(0, shorterStringLength) !== text.substring(0, shorterStringLength)

    const formatter = wasPasted ? pastedFormatter : editedFormatter

    setAmount(formatter(text))
  }

  return (
    <ValidatedTextInput
      returnKeyType="done"
      keyboardType="numeric"
      label={intl.formatMessage(messages.label)}
      value={amount}
      onChangeText={handleSetAmount}
      error={error}
      editable={editable != null ? editable : true}
    />
  )
}

export default injectIntl(AmountField)
