import {useTheme} from '@yoroi/theme'
import * as React from 'react'
import {StyleSheet, Text, View} from 'react-native'
import Animated, {Layout} from 'react-native-reanimated'
import {SafeAreaView} from 'react-native-safe-area-context'

import {Button, Spacer, useModal} from '../../../components'
import {InfoCard} from '../common/InfoCard/InfoCard'
import {mocks} from '../common/mocks'
import {SmallAddressCard} from '../common/SmallAddressCard/SmallAddressCard'
import {useNavigateTo} from '../common/useNavigateTo'
import {useStrings} from '../common/useStrings'
import {QRs} from '../illustrations/QRs'

type Item = {
  isUsed?: boolean
  loading: boolean
}

export const MultipleAddressesScreen = () => {
  const strings = useStrings()
  const {styles} = useStyles()

  const navigate = useNavigateTo()

  const [addressList, setAddressList] = React.useState(mocks.addressList)

  const {openModal} = useModal()
  const [shown, setShown] = React.useState(false)

  if (!shown) {
    openModal(strings.multiplePresentation, <Modal />, modalHeight)

    setShown(true)
  }

  const renderItem = React.useCallback(
    ({item}: {item: Item}) => (
      <SmallAddressCard
        address={mocks.address}
        isUsed={item.isUsed}
        date={mocks.usedAddressDate}
        onPress={() => navigate.receiceDetails()}
        loading={item.loading}
      />
    ),
    [navigate],
  )

  const addMockData = React.useCallback(() => {
    const novoDadoMockado = {isUsed: false, loading: false}
    setAddressList([novoDadoMockado, ...addressList])
  }, [addressList])

  return (
    <SafeAreaView style={styles.root} edges={['left', 'right', 'bottom']}>
      {addressList.length === 20 && (
        <>
          <InfoCard onLimit={true} />

          <Spacer height={16} />
        </>
      )}

      <Animated.FlatList
        data={addressList}
        keyExtractor={(_, i) => String(i)}
        renderItem={renderItem}
        layout={Layout}
        showsVerticalScrollIndicator={false}
      />

      <Animated.View style={[styles.footer, {display: addressList.length === 20 ? 'none' : 'flex'}]} layout={Layout}>
        <Button
          shelleyTheme
          title={strings.generateButton}
          disabled={addressList.length === 20 ? true : false}
          onPress={addMockData}
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
  const {closeModal} = useModal()

  return (
    <View style={styles.modal}>
      <QRs />

      <Text style={[styles.details, {color: colors.details}]}>{strings.multiplePresentationDetails}</Text>

      <Spacer fill />

      <View style={styles.buttonContainer}>
        <Button shelleyTheme title={strings.ok} disabled={mocks.isLoading} onPress={closeModal} style={styles.button} />
      </View>
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
