// @flow
import React from 'react'
import {compose} from 'redux'
import {withHandlers} from 'recompose'
import QRCodeScanner from 'react-native-qrcode-scanner'
import {injectIntl, defineMessages, intlShape} from 'react-intl'

import {withNavigationTitle} from '../../utils/renderUtils'

import type {Navigation} from '../../types/navigation'
import type {ComponentType} from 'react'

const messages = defineMessages({
  title: {
    id: 'components.send.addressreaderqr.title',
    defaultMessage: '!!!Scan QR code address',
    description: 'some desc',
  },
})

type ExternalProps = {|
  navigation: Navigation,
  intl: intlShape,
|}

const AddressReaderQR = ({onSuccess}) => <QRCodeScanner onRead={onSuccess} />

export default injectIntl(
  (compose(
    withNavigationTitle(({intl}) => intl.formatMessage(messages.title)),
    withHandlers({
      onSuccess: ({navigation}) => (event) => {
        const onSuccess = navigation.getParam('onSuccess')
        if (onSuccess) {
          onSuccess(event.data)
        }
      },
    }),
  )(AddressReaderQR): ComponentType<ExternalProps>),
)
