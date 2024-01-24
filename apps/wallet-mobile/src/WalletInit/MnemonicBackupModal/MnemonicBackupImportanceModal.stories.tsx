import {storiesOf} from '@storybook/react-native'
import React from 'react'

import {WithModalProps} from '../../../.storybook/decorators'
import {MnemonicBackupImportanceModal} from './MnemonicBackupImportanceModal'

storiesOf('MnemonicBackupImportanceModal', module).add('Default', () => (
  <WithModalProps>
    {({visible, onRequestClose, onPress}) => (
      <MnemonicBackupImportanceModal
        visible={visible}
        onRequestClose={onRequestClose}
        onConfirm={onPress('onConfirm')}
      />
    )}
  </WithModalProps>
))
