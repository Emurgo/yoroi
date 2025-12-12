import {useLinks} from '@yoroi/links'
import {atoms as a} from '@yoroi/theme'
import {Wallet} from '@yoroi/types'
import {useWalletManagerSelector, useWalletMetas} from '@yoroi/wallet-manager'

import * as React from 'react'
import {ScrollView, useWindowDimensions} from 'react-native'
import {GestureHandlerRootView} from 'react-native-gesture-handler'

import {PendingActionBanner} from '~/features/Links/components/PendingActionBanner'
import {useStrings} from '~/kernel/i18n/useStrings'
import {useWalletNavigation} from '~/kernel/navigation/hooks/useWalletNavigation'
import {Button, ButtonType} from '~/ui/Button/Button'
import {useModal} from '~/ui/Modal/context/ModalContext'
import {Modal} from '~/ui/Modal/ui/screens/Modal/Modal'
import {Space} from '~/ui/Space/Space'

import {WalletListItem} from '../screens/SelectWalletFromListScreen/WalletListItem'

type Props = {
  onSelect: (walletMeta: Wallet.Meta) => void
  onCancel?: () => void
}

export const SelectWalletModal = ({onSelect, onCancel: _onCancel}: Props) => {
  const walletMetas = useWalletMetas()

  const walletList = React.useMemo(
    () =>
      walletMetas?.map((walletMeta) => (
        <React.Fragment key={walletMeta.id}>
          <WalletListItem walletMeta={walletMeta} onPress={onSelect} />
          <Space.Height.lg />
        </React.Fragment>
      )),
    [walletMetas, onSelect],
  )

  return (
    <Modal.Content>
      <GestureHandlerRootView style={[a.flex_1]}>
        <PendingActionBanner />
        <Space.Height.lg />
        <ScrollView style={[a.px_lg]}>{walletList}</ScrollView>
      </GestureHandlerRootView>
    </Modal.Content>
  )
}

const SelectWalletModalFooter = () => {
  const strings = useStrings()
  const {markActionProcessed} = useLinks()
  const {closeModal} = useModal()
  const walletNavigation = useWalletNavigation()

  const handleCancel = () => {
    markActionProcessed()
    closeModal()
    walletNavigation.resetToWalletSelection()
  }

  return (
    <Modal.Footer>
      <Button
        size="S"
        type={ButtonType.Secondary}
        onPress={handleCancel}
        title={strings.global.cancel}
      />
    </Modal.Footer>
  )
}

export const useSelectWalletModal = () => {
  const {openModal, closeModal} = useModal()
  // Use selector to prevent re-renders when selected wallet changes
  const walletManager = useWalletManagerSelector((ctx) => ctx.walletManager)
  const strings = useStrings()
  const {height: windowHeight} = useWindowDimensions()

  const open = React.useCallback(
    ({
      onSelect,
      onCancel,
    }: {
      onSelect: (walletMeta: Wallet.Meta) => void
      onCancel?: () => void
    }) => {
      if (!walletManager) {
        throw new Error('WalletManager not available')
      }
      const handleSelect = (walletMeta: Wallet.Meta) => {
        walletManager.setSelectedWalletId(walletMeta.id)
        closeModal()
        onSelect(walletMeta)
      }

      openModal({
        title: strings.global.walletSelectionScreenHeader,
        content: <SelectWalletModal onSelect={handleSelect} />,
        footer: <SelectWalletModalFooter />,
        height: Math.min(windowHeight * 0.85, 700), // Increased height
        canDiscard: false, // Make modal non-dismissible - user must select a wallet
        onClose: onCancel, // Only called when wallet is selected (via closeModal)
      })
    },
    [openModal, closeModal, walletManager, strings, windowHeight],
  )

  return {openSelectWalletModal: open, closeModal}
}
