import {storiesOf} from '@storybook/react-native'
import React from 'react'

import {nft} from '../../yoroi-wallets/mocks'
import {ModeratedNftIcon} from './ModeratedNftIcon'

storiesOf('V2/AssetList/Moderated NFT Icon', module)
  .add('Pending', () => <ModeratedNftIcon status="pending" nft={nft} />)
  .add('Manual Review', () => <ModeratedNftIcon status="manual_review" nft={nft} />)
  .add('Blocked', () => <ModeratedNftIcon status="blocked" nft={nft} />)
  .add('Consent', () => <ModeratedNftIcon status="consent" nft={nft} />)
  .add('Approved', () => <ModeratedNftIcon status="approved" nft={nft} />)
