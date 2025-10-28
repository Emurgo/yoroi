import {atoms as a} from '@yoroi/theme'
import {Wallet} from '@yoroi/types'

import * as React from 'react'
import {GestureResponderEvent, ScrollView} from 'react-native'

import {useCopy} from '~/features/Copy/context/CopyProvider'
import {useAddressMode} from '~/features/WalletManager/hooks/useAddressMode'
import {useStrings} from '~/kernel/i18n/useStrings'
import {AddressDetailCard} from '~/ui/AddressDetailCard/AddressDetailCard'
import {Button, ButtonType} from '~/ui/Button/Button'
import {Icon} from '~/ui/Icon'
import {useModal} from '~/ui/Modal/context/ModalContext'
import {SafeArea} from '~/ui/SafeArea/SafeArea'
import {
  SingleOrMultipleAddressesModal,
  singleOrMultipleAddressesModalHeight,
} from '~/ui/SingleOrMultipleAddressesModal/SingleOrMultipleAddressesModal'
import {SkeletonAdressDetail} from '~/ui/SkeletonAddressDetail/SkeletonAddressDetail'
import {isEmptyString} from '~/wallets/utils/string'

import {useReceive} from '../common/ReceiveProvider'
import {useMultipleAddressesInfo} from '../common/useMultipleAddressesInfo'
import {useNavigateTo} from '../common/useNavigateTo'
import {useReceiveAddressesStatus} from '../common/useReceiveAddressesStatus'

export const DescribeSelectedAddressScreen = () => {
  const strings = useStrings()
  const navigateTo = useNavigateTo()
  const {selectedAddress} = useReceive()
  const {isSingle: isSingleAddressMode, addressMode} = useAddressMode()
  const addresses = useReceiveAddressesStatus(addressMode)
  const isMultipleAddressesUsed = addresses.used.length > 1
  const {isShowingMultipleAddressInfo} = useMultipleAddressesInfo()
  const {openModal, closeModal} = useModal()

  const {copy} = useCopy()
  const hasAddress = !isEmptyString(selectedAddress)

  const onCopy = (event: GestureResponderEvent) => {
    copy({
      text: selectedAddress,
      feedback: strings.receive.addressCopiedMsg,
      event,
    })
  }

  const handleOnModalConfirm = React.useCallback(
    (method: Wallet.AddressMode) => {
      if (method === 'multiple') {
        navigateTo.multipleAddress()
      }
    },
    [navigateTo],
  )

  React.useEffect(() => {
    if (!isShowingMultipleAddressInfo) return

    const timeout = setTimeout(() => {
      openModal({
        title: strings.receive.singleOrMultiple,
        content: <SingleOrMultipleAddressesModal.Content />,
        footer: (
          <SingleOrMultipleAddressesModal.Footer
            onConfirm={handleOnModalConfirm}
            onClose={closeModal}
          />
        ),
        height: singleOrMultipleAddressesModalHeight,
        canDiscard: false,
      })
    }, 300)
    return () => clearTimeout(timeout)
  }, [
    isShowingMultipleAddressInfo,
    isSingleAddressMode,
    isMultipleAddressesUsed,
    openModal,
    strings.receive.singleOrMultiple,
    handleOnModalConfirm,
    closeModal,
  ])

  return (
    <SafeArea>
      <ScrollView
        contentContainerStyle={[a.px_lg, a.align_center]}
        style={[a.pt_lg]}
      >
        {hasAddress ? (
          <AddressDetailCard title={strings.receive.addresscardTitle} />
        ) : (
          <SkeletonAdressDetail />
        )}
      </ScrollView>

      <SafeArea.Footer style={[a.gap_lg]}>
        <Button
          type={ButtonType.Text}
          title={strings.receive.requestSpecificAmountButton}
          onPress={navigateTo.requestSpecificAmount}
          disabled={!hasAddress}
          testID="receive:request-specific-amount-link"
        />

        <Button
          onPress={onCopy}
          disabled={!hasAddress}
          title={strings.receive.copyAddressButton}
          icon={Icon.Copy}
        />
      </SafeArea.Footer>
    </SafeArea>
  )
}
