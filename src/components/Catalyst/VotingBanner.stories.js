// @flow

import {action} from '@storybook/addon-actions'
import {storiesOf} from '@storybook/react-native'
import React from 'react'

import VotingBanner from './VotingBanner'

storiesOf('Voting Banner', module)
  .add('default', () => <VotingBanner onPress={action('onPress')} disabled={false} />)
  .add('disabled', () => <VotingBanner onPress={action('onPress')} disabled />)
