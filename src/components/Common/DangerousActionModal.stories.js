// @flow

import React, {useState} from 'react'

import {Text} from '../UiKit'
import {storiesOf} from '@storybook/react-native'

import DangerousActionModal from './DangerousActionModal'

const Modal = () => {
  const [visible, setIsVisible] = useState(true)
  return (
    <DangerousActionModal
      visible={visible}
      onRequestClose={() => setIsVisible(false)}
      showCloseIcon
      title="Attention"
      primaryButton={{
        label: 'Cancel',
        onPress: () => setIsVisible(false),
      }}
      alertBox={{
        content: [
          'You should really think about what you are going to do.',
          'Maybe talk to a friend before doing this?',
        ],
      }}
    >
      <Text>
        You are about to perform a dangerous action. Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do
        eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation
        ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate
        velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa
        qui officia deserunt mollit anim id est laborum.
      </Text>
    </DangerousActionModal>
  )
}

storiesOf('DangerousAction', module).add('As modal', () => <Modal />)
