import {storiesOf} from '@storybook/react-native'
import React from 'react'

import {WithModalProps} from '../../../storybook'
import {PoolWarningModal} from './PoolWarningModal'

storiesOf('PoolWarningModal', module)
  .add('0', () => (
    <WithModalProps>
      {({onPress, ...props}) => (
        <PoolWarningModal onPress={onPress('onPress')} {...props} reputationInfo={{node_flags: 0}} />
      )}
    </WithModalProps>
  ))
  .add('1', () => (
    <WithModalProps>
      {({onPress, ...props}) => (
        <PoolWarningModal onPress={onPress('onPress')} {...props} reputationInfo={{node_flags: 1}} />
      )}
    </WithModalProps>
  ))
  .add('2', () => (
    <WithModalProps>
      {({onPress, ...props}) => (
        <PoolWarningModal onPress={onPress('onPress')} {...props} reputationInfo={{node_flags: 2}} />
      )}
    </WithModalProps>
  ))
