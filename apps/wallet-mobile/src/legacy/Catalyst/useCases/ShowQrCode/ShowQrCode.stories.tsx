import {action} from '@storybook/addon-actions'
import {storiesOf} from '@storybook/react-native'
import React from 'react'

import {QrCode} from './ShowQrCode'

storiesOf('Catalyst QrCode', module).add('Show', () => (
  <QrCode votingKeyEncrypted="votingKeyEncrypted" onNext={action('onNext')} />
))
