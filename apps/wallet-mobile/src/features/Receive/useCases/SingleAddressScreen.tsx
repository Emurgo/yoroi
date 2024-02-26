import {useTheme} from '@yoroi/theme'
import _ from 'lodash'
import * as React from 'react'
import {ScrollView, StyleSheet, View} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'

import Icon from '../../../assets/img/copy.png'
import {Button, Spacer} from '../../../components'
import {useCopy} from '../../../legacy/useCopy'
import {useSelectedWallet} from '../../../SelectedWallet'
import {AddressDetailCard} from '../common/AddressDetailCard/AddressDetailCard'
import {SkeletonAdressDetail} from '../common/SkeletonAddressDetail/SkeletonAddressDetail'
import {useAddressDerivationManager} from '../common/useAddressDerivationManager'
import {useNavigateTo} from '../common/useNavigateTo'
import {useReceiveAddressesStatus} from '../common/useReceiveAddressesStatus'
import {useStrings} from '../common/useStrings'

export const SingleAddressScreen = () => {
  const strings = useStrings()
  const {styles, colors} = useStyles()
  const navigate = useNavigateTo()
  const wallet = useSelectedWallet()

  const addressDerivationManager = useAddressDerivationManager()
  const {next: receiveAddress} = useReceiveAddressesStatus(addressDerivationManager.addressDerivation)

  React.useEffect(() => {
    wallet.generateNewReceiveAddressIfNeeded()
  }, [wallet])

  const [isCopying, copy] = useCopy()

  return (
    <SafeAreaView style={styles.root} edges={['left', 'right', 'bottom']}>
      <ScrollView style={{flex: 1}}>
        <View style={styles.address}>
          {receiveAddress != '' ? (
            <AddressDetailCard address={receiveAddress} title={strings.addresscardTitle} />
          ) : (
            <SkeletonAdressDetail />
          )}
        </View>
      </ScrollView>

      <Button
        outline
        title={strings.requestSpecificAmountButton}
        textStyles={{
          color: colors.buttonBackgroundBlue,
        }}
        onPress={() => navigate.specificAmount()}
        disabled={receiveAddress === ''}
      />

      <Spacer height={6} />

      <Button
        shelleyTheme
        onPress={() => {
          copy(receiveAddress)
        }}
        disabled={receiveAddress === ''}
        title={strings.copyAddressButton}
        iconImage={Icon}
        isCopying={isCopying}
        copiedText={strings.addressCopiedMsg}
        style={styles.button}
      />

      <Spacer height={6} />
    </SafeAreaView>
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
    address: {
      flex: 1,
      alignItems: 'center',
    },
    button: {
      backgroundColor: theme.color.primary[500],
    },
  })

  const colors = {
    buttonBackgroundBlue: theme.color.primary[600],
  }

  return {styles, colors} as const
}
