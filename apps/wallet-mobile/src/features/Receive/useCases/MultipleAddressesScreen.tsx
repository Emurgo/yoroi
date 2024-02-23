import {useTheme} from '@yoroi/theme'
import * as React from 'react'
import {StyleSheet, Text, View} from 'react-native'
import Animated, {Layout} from 'react-native-reanimated'
import {SafeAreaView} from 'react-native-safe-area-context'

import {Button, Spacer, useModal} from '../../../components'
import {useSelectedWallet} from '../../../SelectedWallet'
import {BIP32_HD_GAP_LIMIT} from '../common/contants'
import {useMultipleAddresses} from '../common/multipleAddressesModal'
import {useReceive} from '../common/ReceiveProvider'
import {ShowAddressLimitInfo} from '../common/ShowAddressLimitInfo/ShowAddressLimitInfo'
import {SmallAddressCard} from '../common/SmallAddressCard/SmallAddressCard'
import {useAddresses} from '../common/useAddresses'
import {useNavigateTo} from '../common/useNavigateTo'
import {useStrings} from '../common/useStrings'
import {QRs} from '../illustrations/QRs'

type AddressInfo = {
  isUsed: boolean
  address: string
}

export const MultipleAddressesScreen = () => {
  const strings = useStrings()
  const {styles} = useStyles()
  const addresses = useAddresses()
  const {currentAddressChanged} = useReceive()
  const wallet = useSelectedWallet()

  const {modalInfo} = useMultipleAddresses()
  const mappedAddresses = mapAddresses(addresses)
  const navigate = useNavigateTo()

  const {openModal} = useModal()

  React.useEffect(() => {
    modalInfo === false && openModal(strings.multiplePresentation, <Modal />, modalHeight)
  }, [modalInfo, openModal, strings.multiplePresentation])

  const renderItem = React.useCallback(
    ({item}: {item: AddressInfo}) => (
      <SmallAddressCard
        address={item.address}
        isUsed={item.isUsed}
        onPress={() => {
          currentAddressChanged(item?.address)
          navigate.receiceDetails()
        }}
        // date={mocks.usedAddressDate}  // TODO don't have the date??
      />
    ),
    [navigate, currentAddressChanged],
  )

  return (
    <SafeAreaView style={styles.root} edges={['left', 'right', 'bottom']}>
      {mappedAddresses.length >= BIP32_HD_GAP_LIMIT && (
        <>
          <ShowAddressLimitInfo onLimit={true} />

          <Spacer height={16} />
        </>
      )}

      <Animated.FlatList
        data={mappedAddresses}
        keyExtractor={(_, i) => String(i)}
        renderItem={renderItem}
        layout={Layout}
        showsVerticalScrollIndicator={false}
      />

      <Animated.View
        style={[styles.footer, {display: mappedAddresses.length >= BIP32_HD_GAP_LIMIT ? 'none' : 'flex'}]}
        layout={Layout}
      >
        <Button
          shelleyTheme
          title={strings.generateButton}
          disabled={mappedAddresses.length >= BIP32_HD_GAP_LIMIT ? true : false}
          onPress={() => wallet.generateNewReceiveAddress()}
          style={styles.button}
        />
      </Animated.View>
    </SafeAreaView>
  )
}

const modalHeight = 520
const Modal = () => {
  const {styles, colors} = useStyles()
  const strings = useStrings()
  const {hideMultipleAddressesModal} = useMultipleAddresses()
  const {closeModal} = useModal()

  return (
    <View style={styles.modal}>
      <QRs />

      <Text style={[styles.details, {color: colors.details}]}>{strings.multiplePresentationDetails}</Text>

      <Spacer fill />

      <View style={styles.buttonContainer}>
        <Button
          shelleyTheme
          title={strings.ok}
          onPress={() => {
            hideMultipleAddressesModal()
            closeModal()
          }}
          style={styles.button}
        />
      </View>

      <Spacer height={24} />
    </View>
  )
}

const useStyles = () => {
  const {theme} = useTheme()

  const styles = StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: theme.color.gray.min,
      padding: 16,
    },
    modal: {
      flex: 1,
      backgroundColor: theme.color['bottom-sheet-background'],
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    footer: {
      backgroundColor: theme.color.gray.min,
      paddingTop: 16,
    },
    details: {
      ...theme.typography['body-1-l-regular'],
    },
    buttonContainer: {
      alignSelf: 'stretch',
      backgroundColor: theme.color.gray.min,
    },
    button: {
      backgroundColor: theme.color.primary[500],
    },
  })

  const colors = {
    buttonBackgroundBlue: theme.color.primary[600],
    learnMore: theme.color.primary[500],
    details: theme.color.gray[900],
  }

  return {styles, colors} as const
}

const mapAddresses = (addresses: {unused: string[]; used: string[]}): AddressInfo[] => {
  const unusedAddresses = addresses.unused.map((address) => ({
    address,
    isUsed: false,
  }))

  const usedAddresses = addresses.used.map((address) => ({
    address,
    isUsed: true,
  }))

  return [...unusedAddresses, ...usedAddresses]
}
