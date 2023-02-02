import {storiesOf} from '@storybook/react-native'
import React from 'react'

import {ModeratedNftIcon} from './ModeratedNftIcon'

storiesOf('V2/AssetList/Moderated NFT Icon', module)
  .add('Pending', () => (
    <ModeratedNftIcon
      status="pending"
      image="https://fibo-validated-nft-images.s3.amazonaws.com/asset1a6765qk8cpk2wll3hevw6xy9xry893jrzl9ms3.jpeg"
    />
  ))
  .add('Manual Review', () => (
    <ModeratedNftIcon
      status="manual_review"
      image="https://fibo-validated-nft-images.s3.amazonaws.com/asset1a6765qk8cpk2wll3hevw6xy9xry893jrzl9ms3.jpeg"
    />
  ))
  .add('Blocked', () => (
    <ModeratedNftIcon
      status="blocked"
      image="https://fibo-validated-nft-images.s3.amazonaws.com/asset1a6765qk8cpk2wll3hevw6xy9xry893jrzl9ms3.jpeg"
    />
  ))
  .add('Consent', () => (
    <ModeratedNftIcon
      status="consent"
      image="https://fibo-validated-nft-images.s3.amazonaws.com/asset1a6765qk8cpk2wll3hevw6xy9xry893jrzl9ms3.jpeg"
    />
  ))
  .add('Approved', () => (
    <ModeratedNftIcon
      status="approved"
      image="https://fibo-validated-nft-images.s3.amazonaws.com/asset1a6765qk8cpk2wll3hevw6xy9xry893jrzl9ms3.jpeg"
    />
  ))
