import React from 'react'
import {StyleSheet, useWindowDimensions, View} from 'react-native'
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import ViewTransformer from 'react-native-easy-view-transformer'

import {FadeIn} from '../components'
import {MediaPreview} from '../features/Portfolio/common/MediaPreview/MediaPreview'
import {useSelectedWallet} from '../features/WalletManager/Context'
import {useMetrics} from '../metrics/metricsManager'
import {NftRoutes, useParams} from '../navigation'
import {isEmptyString} from '../utils/utils'

type Params = NftRoutes['nft-details']

const isParams = (params?: Params | object | undefined): params is Params => {
  return !!params && 'id' in params && !isEmptyString(params.id)
}

export const NftDetailsImage = () => {
  const {id} = useParams<Params>(isParams)
  const wallet = useSelectedWallet()
  const dimensions = useWindowDimensions()

  // reading from the getter, there is no need to subscribe to changes
  const [amount] = React.useState(wallet.balances.records.get(id))

  const {track} = useMetrics()
  React.useEffect(() => {
    track.nftGalleryDetailsImageViewed()
  }, [track, id])

  // record can be gone when arriving here, need a state
  // TODO: revisit + product definition (missing is gone state)
  if (!amount) return null

  return (
    <FadeIn style={styles.container}>
      <ViewTransformer maxScale={3} minScale={1}>
        <View style={styles.contentContainer}>
          <MediaPreview info={amount.info} width={dimensions.width} height={dimensions.height} contentFit="contain" />
        </View>
      </ViewTransformer>
    </FadeIn>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
    display: 'flex',
    height: '100%',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
})
