// @flow

import React from 'react'
import {TextInput} from 'react-native'
import {compose} from 'redux'
import {connect} from 'react-redux'
import {withHandlers} from 'recompose'

import {pastedFormatter, editedFormatter} from './amountUtils'
import {withTranslations} from '../../utils/renderUtils'

import type {ComponentType} from 'react'

const getTranslations = (state) => state.trans.SendScreen

const handleSetAmount = ({setAmount, amount}) => (text) => {
  const shorterStringLength = Math.min(text.length, amount.length)
  const wasPasted =
    Math.abs(amount.length - text.length) > 1 ||
    amount.substring(0, shorterStringLength) !==
      text.substring(0, shorterStringLength)

  const formatter = wasPasted ? pastedFormatter : editedFormatter

  setAmount(formatter(text))
}

const AmountField = ({style, amount, handleSetAmount, translations}) => (
  <TextInput
    keyboardType="numeric"
    placeholder={translations.amount}
    style={style}
    value={amount}
    onChangeText={handleSetAmount}
  />
)

type ExternalProps = {
  style: mixed,
  amount: string,
  setAmount: (amount: string) => mixed,
}

export default (compose(
  withTranslations(getTranslations),
  withHandlers({
    handleSetAmount,
  }),
)(AmountField): ComponentType<ExternalProps>)
