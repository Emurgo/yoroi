import {storiesOf} from '@storybook/react-native'
import * as React from 'react'

import {WithModalProps} from '../../../../storybook'
import {PoolWarningModal} from './PoolWarningModal'

storiesOf('Pool Warning Modal', module).add('default', () => (
  <WithModalProps>
    {({onPress: _, ...modalProps}) => (
      <PoolWarningModal reputationInfo={{node_flags: 1}} {...modalProps} onPress={modalProps.onRequestClose} />
    )}
  </WithModalProps>
))
