// @flow

import React from 'react'
import {storiesOf} from '@storybook/react-native'

import VotingBanner from './VotingBanner'
import {action} from '@storybook/addon-actions'

storiesOf('Voting Banner', module)
  .add('default', () => <VotingBanner onPress={action('onPress')} disabled={false} />)
  .add('disabled', () => <VotingBanner onPress={action('onPress')} disabled />)
