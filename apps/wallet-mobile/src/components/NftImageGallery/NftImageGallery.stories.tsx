import {storiesOf} from '@storybook/react-native'
import React from 'react'

import {SkeletonGallery} from './NftImageGallery'

storiesOf('NFT/GallerySkeleton', module).add('Skeleton', () => <SkeletonGallery amount={3} />)
