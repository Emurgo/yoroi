import {storiesOf} from '@storybook/react-native'
import React from 'react'

import {nft} from '../../yoroi-wallets/mocks'
import {NftPreview} from './NftPreview'

storiesOf('NftPreview', module)
  .add('Default', () => <NftPreview nft={nft} width={200} height={200} />)
  .add('Showing a placeholder', () => <NftPreview nft={nft} showPlaceholder width={200} height={200} />)
  .add('Blurred image except SVG', () => <NftPreview nft={nft} width={200} height={200} blurRadius={20} />)
  .add('Showing an SVG', () => (
    <NftPreview nft={{...nft, image: 'https://www.svgrepo.com/show/501883/ice-cream.svg'}} width={200} height={200} />
  ))
  .add('Showing NFT thumbnail', () => (
    <NftPreview
      nft={{...nft, thumbnail: 'https://www.svgrepo.com/show/501883/ice-cream.svg'}}
      showThumbnail
      width={200}
      height={200}
    />
  ))
