import {storiesOf} from '@storybook/react-native'
import React from 'react'

import nft1 from './fake-images/nft1.png'
import nft2 from './fake-images/nft2.png'
import nft3 from './fake-images/nft3.png'
import nft4 from './fake-images/nft4.png'
import nft5 from './fake-images/nft5.png'
import nft6 from './fake-images/nft6.png'
import {ImageGallery} from './ImageGallery'

const NFTs = [
  {
    image: nft1,
    text: 'nft1',
  },
  {
    image: nft2,
    text: 'nft2',
  },
  {
    image: nft3,
    text: 'nft3',
  },
  {
    image: nft4,
    text: 'nft4',
  },
  {
    image: nft5,
    text: 'nft5',
  },
  {
    image: nft6,
    text: 'nft6',
  },
]

storiesOf('Image Gallery', module).add('Default', () => <ImageGalleryWrapper />)

const ImageGalleryWrapper = () => {
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false)
    }, 5000)
    return () => clearTimeout(timer)
  }, [])

  return <ImageGallery images={NFTs} loading={loading} />
}
