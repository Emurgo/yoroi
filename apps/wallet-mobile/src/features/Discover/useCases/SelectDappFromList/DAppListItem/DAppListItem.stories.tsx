import {storiesOf} from '@storybook/react-native'
import * as React from 'react'

import CardanoSpot from '../../../../../assets/img/dApp/cardano-spot.png'
import {DAppListItem} from './DAppListItem'

storiesOf('Discover DAppListItem', module)
  .add('initial', () => <Initial />)
  .add('connected', () => <Connected />)

const mockDApp = {
  id: 'cardano_spot',
  name: 'Cardano Spot',
  description: 'Join a global Cardano Community: a single space to communicate, engage, educate with Cardano',
  category: 'media',
  logo: CardanoSpot,
  uri: 'https://cardanospot.io/landing',
  origins: [],
}

const Initial = () => {
  return <DAppListItem dApp={mockDApp} connected={false} />
}

const Connected = () => {
  return <DAppListItem dApp={mockDApp} connected={true} />
}
