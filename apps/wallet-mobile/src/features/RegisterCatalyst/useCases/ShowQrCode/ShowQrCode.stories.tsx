import {action} from '@storybook/addon-actions'
import {storiesOf} from '@storybook/react-native'
import {Catalyst, CatalystProvider} from '@yoroi/staking'
import {catalystConfig} from '@yoroi/staking/src/catalyst/config'
import React from 'react'

import {QrCode} from './ShowQrCode'

storiesOf('Catalyst QrCode', module).add('Show', () => {
  const manager: Catalyst.Manager = {
    config: catalystConfig,
    getFundInfo: action('getFundInfo') as Catalyst.Manager['getFundInfo'],
    fundStatus: action('fundStatus') as Catalyst.Manager['fundStatus'],
  }
  return (
    <CatalystProvider manager={manager} initialState={{votingKeyEncrypted: 'votingKeyEncrypted'}}>
      <QrCode />
    </CatalystProvider>
  )
})
