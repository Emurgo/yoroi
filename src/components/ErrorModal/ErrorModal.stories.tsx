import {storiesOf} from '@storybook/react-native'
import React from 'react'

import {WithModalProps} from '../../../storybook'
import {ErrorModal} from './ErrorModal'

storiesOf('ErrorModal', module)
  .add('Default', () => (
    <WithModalProps>
      {({visible, onRequestClose}) => (
        <ErrorModal
          visible={visible}
          onRequestClose={onRequestClose}
          title="Attention"
          errorMessage={'This is the error message'}
        />
      )}
    </WithModalProps>
  ))
  .add('with errorLogs', () => (
    <WithModalProps>
      {({visible, onRequestClose}) => (
        <ErrorModal
          visible={visible}
          onRequestClose={onRequestClose}
          title="Attention"
          errorMessage={'This is the error message'}
          errorLogs={'This is the error logs'}
        />
      )}
    </WithModalProps>
  ))
