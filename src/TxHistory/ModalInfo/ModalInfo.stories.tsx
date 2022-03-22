import {storiesOf} from '@storybook/react-native'
import React from 'react'
import {Text} from 'react-native'

import {WithModalProps} from '../../../storybook'
import {ModalInfo} from './ModalInfo'

storiesOf('Modal Info', module).add('default', () => (
  <WithModalProps>
    {({visible, onRequestClose}) => (
      <ModalInfo visible={visible} hideModalInfo={onRequestClose}>
        <Text>Some info</Text>
      </ModalInfo>
    )}
  </WithModalProps>
))
