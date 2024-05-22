import {storiesOf} from '@storybook/react-native'
import React from 'react'

import {PrivacyPolicy} from './PrivacyPolicy'

storiesOf('PrivacyPolicy', module).add('Default', () => <PrivacyPolicy languageCode="en-US" />)
