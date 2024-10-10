import {action} from '@storybook/addon-actions'
import {storiesOf} from '@storybook/react-native'
import * as React from 'react'

import {GradientWarning} from './GradientWarning'

storiesOf('GradientWarning', module).add('Default', () => (
  <GradientWarning title="Test Title" description={description} onClose={action('onClose')} />
))

const description = `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed non risus. Suspendisse lectus tortor, dignissim sit amet, adipiscing nec, ultricies sed, dolor. Cras elementum ultrices diam. Maecenas ligula massa, varius a, semper congue, euismod non, mi.`
