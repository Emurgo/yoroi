// @flow
import React from 'react'
import {compose} from 'redux'
import {withHandlers} from 'recompose'
import QRCodeScanner from 'react-native-qrcode-scanner'
import {injectIntl, defineMessages, intlShape} from 'react-intl'

import {withNavigationTitle} from '../../utils/renderUtils'

import type {ComponentType} from 'react'

const messages = defineMessages({
  title: {
    id: 'components.send.addressreaderqr.title',
    defaultMessage: '!!!Scan QR code address',
    description: 'some desc',
  },
})

type ExternalProps = {|
  route: Object, // TODO(navigation): type
  navigation: any,
  intl: intlShape,
|}

const AddressReaderQR = ({onSuccess}) => <QRCodeScanner onRead={onSuccess} />

export default injectIntl(
  (compose(
    withNavigationTitle(({intl}) => intl.formatMessage(messages.title)),
    withHandlers({
      onSuccess: ({route}) => (event) => {
        const onSuccess = route.params?.onSuccess
        if (onSuccess) {
          onSuccess(event.data)
        }
      },
    }),
  )(AddressReaderQR): ComponentType<ExternalProps>),
)
