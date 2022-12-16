import {storiesOf} from '@storybook/react-native'
import React from 'react'

import {SkeletonGallery} from './ImageGallery'

storiesOf('Image Gallery', module).add('Skeleton', () => <SkeletonGallery amount={3} />)
