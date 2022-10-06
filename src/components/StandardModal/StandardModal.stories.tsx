import {storiesOf} from '@storybook/react-native'
import React from 'react'
import {Text} from 'react-native'

import {WithModalProps} from '../../../storybook'
import {StandardModal} from './StandardModal'

storiesOf('StandardModal', module).add('Default', () => (
  <WithModalProps>
    {({onPress, ...modalProps}) => (
      <StandardModal
        {...modalProps}
        showCloseIcon
        title="Attention"
        primaryButton={{
          label: 'Confirm',
          onPress: onPress('primary'),
        }}
        secondaryButton={{
          label: 'Cancel',
          onPress: onPress('secondary'),
        }}
      >
        <Text>
          You are about to perform a dangerous action. Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do
          eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation
          ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate
          velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in
          culpa qui officia deserunt mollit anim id est laborum.
        </Text>
      </StandardModal>
    )}
  </WithModalProps>
))
