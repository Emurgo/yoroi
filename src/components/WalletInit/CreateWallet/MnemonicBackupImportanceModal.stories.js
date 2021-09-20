// @flow

import {storiesOf} from '@storybook/react-native'
import React from 'react'

import {withModalProps} from '../../../../storybook'
import MnemonicBackupImportanceModal from './MnemonicBackupImportanceModal'

storiesOf('MnemonicBackupImportanceModal', module)
  .addDecorator(withModalProps)
  .add('Default', ({visible, onRequestClose, onPress}) => {
    return (
      <MnemonicBackupImportanceModal
        visible={visible}
        onRequestClose={onRequestClose}
        onConfirm={() => onPress('onConfirm')}
      />
    )
  })
