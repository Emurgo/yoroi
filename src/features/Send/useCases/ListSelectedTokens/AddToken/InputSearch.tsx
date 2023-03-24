import * as React from 'react'
import {defineMessages, useIntl} from 'react-intl'

import {TextInput, TextInputProps} from '../../../../../components'

export const InputSearch = (props: TextInputProps) => {
  const strings = useStrings()

  return <TextInput {...props} label={strings.searchLabel} />
}

const useStrings = () => {
  const intl = useIntl()

  return {
    searchLabel: intl.formatMessage(messages.searchLabel),
  }
}

const messages = defineMessages({
  searchLabel: {
    id: 'components.send.assetselectorscreen.searchlabel',
    defaultMessage: '!!!Search by name or subject',
  },
})
