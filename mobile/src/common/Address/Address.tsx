import {atoms as a, useTheme} from '@yoroi/theme'

import * as React from 'react'
import {Text, View, useWindowDimensions} from 'react-native'

import AddressModal, {
  AddressModalFooter,
} from '~/common/AddressModal/AddressModal'
import {useStrings} from '~/kernel/i18n/useStrings'
import {Copiable} from '~/ui/Copiable/Copiable'
import {useModal} from '~/ui/Modal/context/ModalContext'
import {Space} from '~/ui/Space/Space'

type Props = {
  address: string
  style?: View['props']['style']
  textStyle?: Text['props']['style']
  rightAdornment?: React.ReactNode
}

export const Address = ({address, style, textStyle, rightAdornment}: Props) => {
  const strings = useStrings()
  const {atoms: ta} = useTheme()
  const {openModal} = useModal()
  const screenHeight = useWindowDimensions().height
  const modalHeight = Math.min(screenHeight * 0.8, 650)

  const handleOpenAddressModal = React.useCallback(() => {
    openModal({
      title: strings.transactions.addressDetailsTitle,
      content: <AddressModal address={address} />,
      footer: <AddressModalFooter address={address} />,
      height: modalHeight,
    })
  }, [
    address,
    openModal,
    strings.transactions.addressDetailsTitle,
    modalHeight,
  ])

  return (
    <Copiable text={address} onPress={handleOpenAddressModal}>
      <View style={[a.flex_row, a.align_center, {flex: 1}, style]}>
        <View style={{flex: 1}}>
          <Text numberOfLines={1} ellipsizeMode="middle" style={textStyle}>
            <Text style={[a.body_2_md_regular, ta.text_gray_medium]}>
              {address.slice(0, -6)}
            </Text>
            <Text style={[a.body_2_md_medium, ta.el_primary_medium]}>
              {' '}
              {address.slice(-6)}
            </Text>
          </Text>
        </View>
        {rightAdornment && (
          <>
            <Space.Width.xs />
            {rightAdornment}
          </>
        )}
      </View>
    </Copiable>
  )
}
