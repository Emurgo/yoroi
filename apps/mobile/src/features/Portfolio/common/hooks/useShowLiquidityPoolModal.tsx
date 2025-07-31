import * as React from 'react'
import {useSafeAreaInsets} from 'react-native-safe-area-context'

import {useModal} from '~/ui/Modal/ModalContext'
import {LiquidityPoolModal} from '~/features/Portfolio/screens/PortfolioTokensList/PortfolioDAppsTokenList/LiquidityPoolModal'
import {ILiquidityPool} from './useGetLiquidityPool'

const LIQUIDITY_POOL_MODAL_HEIGHT = 278

export const useShowLiquidityPoolModal = () => {
  const {openModal, closeModal} = useModal()
  const insets = useSafeAreaInsets()

  const dialogHeight = insets.bottom + LIQUIDITY_POOL_MODAL_HEIGHT

  const handleShowLiquidityPoolModal = React.useCallback(
    (liquidityPool: ILiquidityPool) => {
      openModal({
        content: (
          <LiquidityPoolModal splitTokenSymbol="-" tokenInfo={liquidityPool} />
        ),
        height: dialogHeight,
      })
    },
    [dialogHeight, openModal],
  )

  const handleCloseLiquidityPoolModal = React.useCallback(() => {
    closeModal()
  }, [closeModal])

  return {
    onShow: handleShowLiquidityPoolModal,
    onClose: handleCloseLiquidityPoolModal,
  }
}
