// @flow

import React from 'react'
import {storiesOf} from '@storybook/react-native'

import {withModalProps} from '../../../storybook/decorators'
import ErrorModal from './ErrorModal'

storiesOf('ErrorModal', module)
  .addDecorator(withModalProps)
  .add('Default', ({visible, onRequestClose}) => (
    <ErrorModal
      visible={visible}
      onRequestClose={onRequestClose}
      title="Attention"
      errorMessage={'This is the error message'}
    />
  ))
  .add('with errorLogs', ({visible, onRequestClose}) => (
    <ErrorModal
      visible={visible}
      onRequestClose={onRequestClose}
      title="Attention"
      errorMessage={'This is the error message'}
      errorLogs={'This is the error logs'}
    />
  ))
