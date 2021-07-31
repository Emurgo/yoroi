// @flow

import React from 'react'

import {storiesOf} from '@storybook/react-native'

import MnemonicExplanationModal from './MnemonicExplanationModal'
import {withModalProps} from '../../../../storybook'

storiesOf('MnemonicExplanationModal', module)
  .addDecorator(withModalProps)
  .add('Default', ({visible, onPress, onRequestClose}) => (
    <MnemonicExplanationModal visible={visible} onConfirm={onPress('onConfirm')} onRequestClose={onRequestClose} />
  ))
