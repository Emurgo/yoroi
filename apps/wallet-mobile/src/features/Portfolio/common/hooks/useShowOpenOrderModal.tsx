import * as React from 'react'
import {useSafeAreaInsets} from 'react-native-safe-area-context'

import {useModal} from '../../../../components'
import {OpenOrderModal} from '../../useCases/PortfolioTokensList/PortfolioDAppsTokenList/OpenOrderModal'
import {IOpenOrders} from './useGetOpenOrders'

const OPEN_ORDER_MODAL_HEIGHT = 278

export const useShowOpenOrderModal = () => {
  const {openModal, closeModal} = useModal()
  const insets = useSafeAreaInsets()

  const dialogHeight = insets.bottom + OPEN_ORDER_MODAL_HEIGHT

  const handleShowOpenOrderModal = React.useCallback(
    (order: IOpenOrders) => {
      openModal('', <OpenOrderModal splitTokenSymbol="/" tokenInfo={order} />, dialogHeight)
    },
    [dialogHeight, openModal],
  )

  const handleCloseOpenOrderModal = React.useCallback(() => {
    closeModal()
  }, [closeModal])

  return {
    onShow: handleShowOpenOrderModal,
    onClose: handleCloseOpenOrderModal,
  }
}
