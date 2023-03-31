import {action} from '@storybook/addon-actions'
import {storiesOf} from '@storybook/react-native'
import React from 'react'

import {RemoveAmountButton} from './RemoveAmount'

storiesOf('Remove Amount Button', module).add('initial', () => <RemoveAmountButton onPress={() => action(`onPress`)} />)
