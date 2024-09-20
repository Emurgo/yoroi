import {useTheme} from '@yoroi/theme'
import React from 'react'
import {StyleSheet, useWindowDimensions, View} from 'react-native'
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import ViewTransformer from 'react-native-easy-view-transformer'

import {FadeIn} from '../../../../../../components/FadeIn'
import {useMetrics} from '../../../../../../kernel/metrics/metricsManager'
import {NftRoutes, useParams} from '../../../../../../kernel/navigation'
import {isEmptyString} from '../../../../../../kernel/utils'
import {useSelectedWallet} from '../../../../../WalletManager/common/hooks/useSelectedWallet'
import {MediaPreview} from '../../../../common/MediaPreview/MediaPreview'

type Params = NftRoutes['nft-details']

const isParams = (params?: Params | object | undefined): params is Params => {
  return !!params && 'id' in params && !isEmptyString(params.id)
}

export const ZoomMediaImageScreen = () => {
  const {id} = useParams<Params>(isParams)
  const {wallet} = useSelectedWallet()
  const dimensions = useWindowDimensions()
  const styles = useStyles()

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
          <MediaPreview
            info={amount.info}
            width={dimensions.width}
            height={dimensions.height}
            contentFit="contain"
            style={styles.image}
          />
        </View>
      </ViewTransformer>
    </FadeIn>
  )
}

const useStyles = () => {
  const {color, atoms} = useTheme()
  const styles = StyleSheet.create({
    container: {
      backgroundColor: color.bg_color_max,
      ...atoms.flex_1,
    },
    contentContainer: {
      ...atoms.flex,
      ...atoms.flex_1,
      ...atoms.h_full,
      ...atoms.flex_col,
      ...atoms.align_center,
      ...atoms.justify_center,
    },
    image: {
      backgroundColor: color.gray_100,
    },
  })
  return styles
}