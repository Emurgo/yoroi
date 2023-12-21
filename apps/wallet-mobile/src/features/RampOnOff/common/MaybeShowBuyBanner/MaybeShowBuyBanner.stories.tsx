import {storiesOf} from '@storybook/react-native'
import * as React from 'react'
import {Text} from 'react-native'

import {SelectedWalletProvider} from '../../../../SelectedWallet'
import {mocks as walletMocks} from '../../../../yoroi-wallets/mocks'
import {RampOnOffProvider} from '../../common/RampOnOffProvider'
import {MaybeShowBuyBanner} from './MaybeShowBuyBanner'

storiesOf('RampOnOff MaybeShowBuyBanner', module) //
  .add('5>, no banner', () => <NoBanner />)
  .add('0>5<, 30d< show small', () => <NoBanner />)
  .add('0>5<, 30d> no banner', () => <NoBanner />)
  .add('0, big banner', () => <NoBanner />)

const NoBanner = () => {
  return (
    <SelectedWalletProvider wallet={{...walletMocks.wallet}}>
      <RampOnOffProvider>
        <Text>The only thing you should be seeing is this text</Text>

        <MaybeShowBuyBanner />
      </RampOnOffProvider>
    </SelectedWalletProvider>
  )
}
