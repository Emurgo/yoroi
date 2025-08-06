import {atoms as a, useTheme} from '@yoroi/theme'
import {Wallet} from '@yoroi/types'
import * as React from 'react'
import {Text, View} from 'react-native'

import {useMultipleAddressesInfo} from '~/features/Receive/common/useMultipleAddressesInfo'
import {useAddressMode} from '~/features/WalletManager/hooks/useAddressMode'
import {useStrings} from '~/kernel/i18n/useStrings'
import {Button, ButtonType} from '~/ui/Button/Button'

export const singleOrMultipleAddressesModalHeight = 580

type Props = {
  onConfirm: (addressMode: Wallet.AddressMode) => void
  onClose: () => void
}

export const SingleOrMultipleAddressesModal = ({onConfirm, onClose}: Props) => {
  const strings = useStrings()
  const {enableMultipleMode, enableSingleMode} = useAddressMode()

  const {hideMultipleAddressesInfo} = useMultipleAddressesInfo()

  const {palette: p} = useTheme()

  const handleOnMultiple = () => {
    enableMultipleMode()
    hideMultipleAddressesInfo({
      onSuccess: () => {
        onClose()
        onConfirm('multiple')
      },
    })
  }

  const handleOnSingle = () => {
    enableSingleMode()
    hideMultipleAddressesInfo({
      onSuccess: () => {
        onClose()
        onConfirm('single')
      },
    })
  }

  return (
    <View
      style={[a.flex_1, a.align_center, a.justify_between, a.px_lg, a.py_lg]}
    >
      {/* TODO: REVISIT, this breaks the app. investigate why */}
      {/*  <QRs /> */}

      <Text
        style={[
          a.body_1_lg_regular,
          a.justify_center,
          a.text_center,
          {color: p.text_gray_medium},
        ]}
      >
        {strings.receive.singleOrMultipleDetails}
      </Text>

      <View style={[{flex: 1}]} />

      <View style={[a.flex_col, a.gap_sm, a.w_full, {height: 120}]}>
        <Button
          type={ButtonType.Text}
          title={strings.receive.selectMultiple}
          onPress={handleOnMultiple}
        />

        <Button
          title={strings.receive.singleAddressWallet}
          onPress={handleOnSingle}
        />
      </View>
    </View>
  )
}
