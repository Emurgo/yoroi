// @flow
import React from 'react'
import {compose} from 'redux'
import {withHandlers} from 'recompose'
import QRCodeScanner from 'react-native-qrcode-scanner'

import {withTranslations, withNavigationTitle} from '../../utils/renderUtils'

import type {Navigation} from '../../types/navigation'
import type {ComponentType} from 'react'

const getTranslations = (state) => state.trans.ReadQRCodeAddressScreen

type ExternalProps = {|
  navigation: Navigation,
|}

const AddressReaderQR = ({address, setAddress, onSuccess}) => (
  <QRCodeScanner onRead={onSuccess} />
)

export default (compose(
  withTranslations(getTranslations),
  withNavigationTitle(({translations}) => translations.title),
  withHandlers({
    onSuccess: ({navigation}) => (event) => {
      const onSuccess = navigation.getParam('onSuccess')
      if (onSuccess) {
        onSuccess(event.data)
      }
    },
  }),
)(AddressReaderQR): ComponentType<ExternalProps>)
