// @flow
import React from 'react'
import {connect} from 'react-redux'
import {compose} from 'redux'
import QRCode from 'react-native-qrcode'

import type {SubTranslation} from '../../l10n/typeHelpers'

const getTranslations = (state) => state.trans.AddressDetail

type Props = {
  address: string,
  translations: SubTranslation<typeof getTranslations>,
}

const AddressDetail = ({address, translations}: Props) => (
  <QRCode value={address} size={140} bgColor="#000" fgColor="#fff" />
)

export default compose(
  connect((state) => ({
    translations: getTranslations(state),
  })),
)(AddressDetail)
