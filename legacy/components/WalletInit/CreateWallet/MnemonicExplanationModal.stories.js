// @flow

import {storiesOf} from '@storybook/react-native'
import React from 'react'

import {withModalProps} from '../../../../storybook'
import MnemonicExplanationModal from './MnemonicExplanationModal'

storiesOf('MnemonicExplanationModal', module)
  .addDecorator(withModalProps)
  .add('Default', ({visible, onPress, onRequestClose}) => (
    <MnemonicExplanationModal visible={visible} onConfirm={onPress('onConfirm')} onRequestClose={onRequestClose} />
  ))
