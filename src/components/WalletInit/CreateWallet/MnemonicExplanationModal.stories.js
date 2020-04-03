// @flow

import React from 'react'
import {compose} from 'redux'
import {withStateHandlers} from 'recompose'

import {storiesOf} from '@storybook/react-native'

import MnemonicExplanationModal from './MnemonicExplanationModal'

const ModalWrapper = compose(
  withStateHandlers(
    {
      visible: true,
    },
    {
      onRequestClose: (state) => () => ({visible: false}),
      onConfirm: (state) => () => ({visible: false}),
    },
  ),
)(MnemonicExplanationModal)

storiesOf('MnemonicExplanationModal', module).add('Default', () => (
  <ModalWrapper />
))
