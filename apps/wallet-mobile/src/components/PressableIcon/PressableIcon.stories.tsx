import {action} from '@storybook/addon-actions'
import {storiesOf} from '@storybook/react-native'
import * as React from 'react'

import {Icon} from '../Icon'
import {PressableIcon} from './PressableIcon'

storiesOf('PressableIcon', module).add('Icon.ExternalLink', () => (
  <PressableIcon icon={Icon.ExternalLink} onPress={action('onPress.ExternalLink')} />
))
