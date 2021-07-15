// @flow
import React from 'react'
import {compose} from 'redux'
import {withHandlers} from 'recompose'
import QRCodeScanner from 'react-native-qrcode-scanner'
import {injectIntl, type IntlShape} from 'react-intl'

import type {ComponentType} from 'react'

type ExternalProps = {|
  route: Object, // TODO(navigation): type
  navigation: any,
  intl: IntlShape,
|}

type Props = {
  onSuccess: (event: {data: string}) => void,
}
const AddressReaderQR = ({onSuccess}: Props) => <QRCodeScanner onRead={onSuccess} />

export default injectIntl(
  (compose(
    withHandlers({
      onSuccess:
        ({route}) =>
        (event) => {
          const onSuccess = route.params?.onSuccess
          if (onSuccess) {
            onSuccess(event.data)
          }
        },
    }),
  )(AddressReaderQR): ComponentType<ExternalProps>),
)
