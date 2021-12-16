import {storiesOf} from '@storybook/react-native'
import React from 'react'

import {WithModalProps} from '../../../storybook'
import {MnemonicExplanationModal} from './MnemonicExplanationModal'

storiesOf('MnemonicExplanationModal', module).add('Default', () => (
  <WithModalProps>
    {({visible, onPress, onRequestClose}) => (
      <MnemonicExplanationModal visible={visible} onConfirm={onPress('onConfirm')} onRequestClose={onRequestClose} />
    )}
  </WithModalProps>
))
