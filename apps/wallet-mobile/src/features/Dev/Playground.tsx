import {bannersManagerMaker, BannersProvider} from '@yoroi/banners'
import {observableStorageMaker} from '@yoroi/common'
import {useTheme} from '@yoroi/theme'
import {Banners} from '@yoroi/types'
import * as React from 'react'
import {SafeAreaView} from 'react-native-safe-area-context'

import {Button} from '../../components/Button/Button'
import {Spacer} from '../../components/Spacer/Spacer'
import {logger} from '../../kernel/logger/logger'
import {useSelectedWallet} from '../WalletManager/common/hooks/useSelectedWallet'

// --------------------------------------------------------------------------------------------------
// PINEED: this component can be replaced at anytime by anyone

export const Playground = () => {
  const {
    atoms: {pl_lg, pr_lg},
  } = useTheme()
  const {wallet} = useSelectedWallet()
  const walletStorage = wallet.networkManager.rootStorage.join(`${wallet.id}/`)
  const bannersStorage = observableStorageMaker<false, Banners.StorageKey>(walletStorage.join('banners/'))
  const bannersManager = bannersManagerMaker<Banners.StorageKey>({
    storage: bannersStorage,
  })
  const [refresh, setRefresh] = React.useState(0)

  bannersStorage.onChange([Banners.Id.DRep2UsStakingCenter], () => {
    logger.debug(`BannersStorageKey ${Banners.Id.DRep2UsStakingCenter}:`, {
      dismissedAt: bannersManager.dismissedAt(Banners.Id.DRep2UsStakingCenter),
    })
  })

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={[pl_lg, pr_lg]}>
      <Button
        title="Reset"
        onPress={() => {
          bannersStorage.setItem(Banners.Id.DRep2UsStakingCenter, '0')
          setRefresh(() => refresh + 1)
        }}
      />

      <Spacer height={20} />

      <BannersProvider manager={bannersManager} key={refresh}></BannersProvider>
    </SafeAreaView>
  )
}
