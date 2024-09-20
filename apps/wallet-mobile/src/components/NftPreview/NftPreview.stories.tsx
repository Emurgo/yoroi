import {storiesOf} from '@storybook/react-native'
import React from 'react'

import {nft} from '../../yoroi-wallets/mocks/wallet'
import {NftPreview} from './NftPreview'

storiesOf('NftPreview', module)
  .add('Default', () => <NftPreview nft={nft} width={200} height={200} />)
  .add('Showing a placeholder', () => <NftPreview nft={nft} showPlaceholder width={200} height={200} />)
  .add('Blurred image except SVG', () => <NftPreview nft={nft} width={200} height={200} blurRadius={20} />)
  .add('Showing an SVG', () => (
    <NftPreview nft={{...nft, image: 'https://www.svgrepo.com/show/501883/ice-cream.svg'}} width={200} height={200} />
  ))
  .add('Showing an SVG with blur radius enabled', () => (
    <NftPreview
      nft={{...nft, image: 'https://www.svgrepo.com/show/501883/ice-cream.svg'}}
      width={200}
      height={200}
      blurRadius={5}
    />
  ))
  .add('Showing NFT with incorrect metadata files field', () => (
    <NftPreview
      nft={{
        ...nft,
        metadatas: {
          mintNft: {
            name: 'NFT 0',
            description: 'NFT 0 description',
            files: {
              ipfs: 'QmZ89agib39odneyezeyxp2ekXPLqm86NHCgEXZy9PJ1Gs',
            },
          },
        },
      }}
      width={200}
      height={200}
    />
  ))
