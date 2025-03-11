import {useBanner, useBanners} from '@yoroi/banners'
import {useTheme} from '@yoroi/theme'
import * as React from 'react'
import {Button, Text, View} from 'react-native'

import {yoroiDRepIdHex} from '../../../kernel/constants'
import {DismissibleBanner} from '../common/DismissableBanner'
import {shouldShowDRepConsiderDelegating} from '../common/should-show-drep-consider-delegating'
import {BannerId, BannerStorageKey} from '../common/types'

type Props = {
  isStaking: boolean
  currentDRepIdHex: string
}

export const ShowBannerDRepConsiderDelegating = ({isStaking, currentDRepIdHex}: Props) => {
  const {
    color: {gray_200},
    atoms: {p_lg},
  } = useTheme()
  const {manager} = useBanners<BannerStorageKey>()
  const {dismiss, dismissedAt} = useBanner({id: BannerId.DRepConsiderDelegating, manager})

  const shouldShow = shouldShowDRepConsiderDelegating({
    yoroiDRepIdHex,
    currentDRepIdHex,
    isStaking,
    dismissedAt,
  })

  return (
    <DismissibleBanner isVisible={shouldShow} style={{backgroundColor: gray_200, ...p_lg, borderRadius: 4}}>
      <View>
        <Text>Consider delegating to DREP</Text>

        <Button onPress={() => dismiss()} title="Dismiss" />
      </View>
    </DismissibleBanner>
  )
}
