import {atoms as a, useTheme} from '@yoroi/theme'
import * as React from 'react'
import {useWindowDimensions, View} from 'react-native'

// @ts-ignore
import ViewTransformer from 'react-native-easy-view-transformer'

import {useSelectedWallet} from '~/features/WalletManager/hooks/useSelectedWallet'
import {useMetrics} from '~/kernel/metrics/metricsManager'
import {useParams} from '~/kernel/navigation/hooks/useParams'
import {NftRoutes} from '~/kernel/navigation/types'
import {FadeIn} from '~/ui/FadeIn/FadeIn'
import {MediaPreview} from '~/ui/MediaPreview/MediaPreview'
import {isEmptyString} from '~/wallets/utils/string'

type Params = NftRoutes['nft-details']

const isParams = (params?: Params | object | undefined): params is Params => {
  return !!params && 'id' in params && !isEmptyString(params.id)
}

export const ZoomMediaImageScreen = () => {
  const {atoms: ta, palette: p} = useTheme()
  const {id} = useParams<Params>(isParams)
  const {wallet} = useSelectedWallet()
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
    <FadeIn style={[{backgroundColor: p.bg_color_max}, a.flex_1]}>
      <ViewTransformer maxScale={3} minScale={1}>
        <View
          style={[
            a.flex,
            a.flex_1,
            a.h_full,
            a.flex_col,
            a.align_center,
            a.justify_center,
          ]}
        >
          <MediaPreview
            info={amount.info}
            width={dimensions.width}
            height={dimensions.height}
            contentFit="contain"
            style={[{backgroundColor: p.gray_100}]}
          />
        </View>
      </ViewTransformer>
    </FadeIn>
  )
}
