import {RouteProp, useNavigation, useRoute} from '@react-navigation/native'
import assert from 'assert'
import React from 'react'
import {StyleSheet} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'

import {WalletInitRouteNavigation, WalletInitRoutes} from '../../navigation'
import {COLORS} from '../../theme'
import {isEmptyString} from '../../utils/utils'
import {generateAdaMnemonic} from '../../yoroi-wallets/cardano/mnemonic'
import {MnemonicExplanationModal} from '../MnemonicExplanationModal'
import {WalletForm} from '../WalletForm'

type WalletFormData = null | {name: string; password: string}
export const CreateWalletScreen = () => {
  const navigation = useNavigation<WalletInitRouteNavigation>()
  const route = useRoute<RouteProp<WalletInitRoutes, 'create-wallet-form'>>()
  const [visibleMnemonicExplanation, setVisibleMnemonicExplanation] = React.useState(false)
  const [formData, _setFormData] = React.useState<WalletFormData>(null)

  const setFormData = (formData: WalletFormData) => {
    _setFormData(formData)
    setVisibleMnemonicExplanation(true)
  }

  const hideMnemonicExplanation = () => setVisibleMnemonicExplanation(false)

  const navigateToMnemonicScreen = () => {
    hideMnemonicExplanation()
    const mnemonic = generateAdaMnemonic()
    const {networkId, walletImplementationId} = route.params
    const name = formData?.name
    const password = formData?.password

    assert(!isEmptyString(name), 'Wallet name is required')
    assert(!isEmptyString(password), 'Password is required')

    navigation.navigate('mnemonic-show', {
      mnemonic,
      networkId,
      walletImplementationId,
      name,
      password,
    })
  }

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right', 'bottom']}>
      <WalletForm onSubmit={setFormData} />

      <MnemonicExplanationModal
        visible={visibleMnemonicExplanation}
        onRequestClose={hideMnemonicExplanation}
        onConfirm={navigateToMnemonicScreen}
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
  },
})
