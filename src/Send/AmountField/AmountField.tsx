import React from 'react'
import {defineMessages, useIntl} from 'react-intl'

import {editedFormatter, pastedFormatter} from '../../../legacy/components/Send/amountUtils'
import {TextInput} from '../../../legacy/components/UiKit'

type Props = {
  amount: string
  setAmount: (amount: string) => void
  error?: string | null | undefined
  editable?: boolean
}

export const AmountField = ({amount, error, editable, setAmount}: Props) => {
  const intl = useIntl()
  const handleSetAmount = (text: string) => {
    const shorterStringLength = Math.min(text.length, amount.length)
    const wasPasted =
      Math.abs(amount.length - text.length) > 1 ||
      amount.substring(0, shorterStringLength) !== text.substring(0, shorterStringLength)

    const formatter = wasPasted ? pastedFormatter : editedFormatter

    setAmount(formatter(text))
  }

  return (
    <TextInput
      returnKeyType="done"
      keyboardType="numeric"
      label={intl.formatMessage(messages.label)}
      value={amount}
      onChangeText={handleSetAmount}
      errorText={error || undefined}
      editable={editable != null ? editable : true}
      faded={editable != null ? !editable : false}
    />
  )
}

const messages = defineMessages({
  label: {
    id: 'components.send.amountfield.label',
    defaultMessage: '!!!Amount',
  },
})
