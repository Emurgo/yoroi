import {bannersManagerMaker, BannersProvider} from '@yoroi/banners'
import {observableStorageMaker} from '@yoroi/common'
import {useTheme} from '@yoroi/theme'
import * as React from 'react'
import {SafeAreaView} from 'react-native-safe-area-context'

import {Button} from '../../components/Button/Button'
import {Spacer} from '../../components/Spacer/Spacer'
import {logger} from '../../kernel/logger/logger'
import {BannerId, BannerStorageKey} from '../Banners/common/types'
import {ShowBannerDRepConsiderDelegating} from '../Banners/useCases/ShowBannerDRepConsiderDelegating'
import {useSelectedWallet} from '../WalletManager/common/hooks/useSelectedWallet'

// --------------------------------------------------------------------------------------------------
// PINEED: this component can be replaced at anytime by anyone

export const Playground = () => {
  const {
    atoms: {pl_lg, pr_lg},
  } = useTheme()
  const {wallet} = useSelectedWallet()
  const walletStorage = wallet.networkManager.rootStorage.join(`${wallet.id}/`)
  const bannersStorage = observableStorageMaker<false, BannerStorageKey>(walletStorage.join('banners/'))
  const bannersManager = bannersManagerMaker<BannerStorageKey>({
    storage: bannersStorage,
  })
  const [refresh, setRefresh] = React.useState(0)

  bannersStorage.onChange([BannerId.DRepConsiderDelegating], () => {
    logger.debug(`BannersStorageKey ${BannerId.DRepConsiderDelegating}:`, {
      dismissedAt: bannersManager.dismissedAt(BannerId.DRepConsiderDelegating),
    })
  })

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={[pl_lg, pr_lg]}>
      <Button
        title="Reset"
        onPress={() => {
          bannersStorage.setItem(BannerId.DRepConsiderDelegating, '0')
          setRefresh(() => refresh + 1)
        }}
      />

      <Spacer height={20} />

      <BannersProvider manager={bannersManager} key={refresh}>
        <ShowBannerDRepConsiderDelegating isStaking={true} currentDRepIdHex="123" />
      </BannersProvider>
    </SafeAreaView>
  )
}
