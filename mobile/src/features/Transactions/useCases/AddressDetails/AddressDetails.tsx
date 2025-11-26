import {atoms as a, useTheme} from '@yoroi/theme'

import {useRoute} from '@react-navigation/native'
import * as React from 'react'
import {Linking, Text, TouchableOpacity, View} from 'react-native'
import {useWindowDimensions} from 'react-native'

import {useSelectedWallet} from '~/features/WalletManager/hooks/useSelectedWallet'
import {useStrings} from '~/kernel/i18n/useStrings'
import {Button, ButtonType} from '~/ui/Button/Button'
import {Copiable} from '~/ui/Copiable/Copiable'
import {useModal} from '~/ui/Modal/context/ModalContext'
import {SafeArea} from '~/ui/SafeArea/SafeArea'
import {ScrollView} from '~/ui/ScrollView/ScrollView'
import {useScrollView} from '~/ui/ScrollView/hooks/useScrollView'

import AddressModal from '../TxDetails/AddressModal/AddressModal'

type Params = {
  address: string
}

const Label = ({children}: {children: string}) => {
  const {atoms: ta} = useTheme()

  return (
    <Text
      style={[
        a.pt_lg,
        a.body_2_md_regular,
        ta.text_gray_medium,
        {marginBottom: 8},
      ]}
    >
      {children}
    </Text>
  )
}

export const AddressDetails = () => {
  const strings = useStrings()
  const {atoms: ta} = useTheme()
  const {address} = useRoute().params as Params
  const {wallet} = useSelectedWallet()
  const explorers = wallet.networkManager.explorers
  const {scrollViewRef} = useScrollView()
  const {openModal} = useModal()
  const screenHeight = useWindowDimensions().height
  const modalHeight = Math.min(screenHeight * 0.8, 650)

  const openAddressModal = () =>
    openModal({
      title: strings.transactions.addessModalTitle,
      content: <AddressModal address={address} />,
      height: modalHeight,
    })

  return (
    <SafeArea>
      <ScrollView contentContainerStyle={a.px_lg} ref={scrollViewRef}>
        <Label>{strings.transactions.address}</Label>

        <TouchableOpacity activeOpacity={0.5} onPress={openAddressModal}>
          <Text style={[ta.text_gray_medium, a.body_2_md_regular]}>
            {address}
          </Text>
        </TouchableOpacity>

        <Copiable title={address} text={address} />
      </ScrollView>

      <SafeArea.Footer>
        <View style={[a.flex_row, a.gap_lg, a.justify_center]}>
          <Button
            type={ButtonType.Secondary}
            onPress={() =>
              Linking.openURL(explorers.cardanoscan.address(address))
            }
            title="Cardanoscan"
          />
          <Button
            type={ButtonType.Secondary}
            onPress={() =>
              Linking.openURL(explorers.cexplorer.address(address))
            }
            title="Cexplorer"
          />
        </View>
      </SafeArea.Footer>
    </SafeArea>
  )
}
