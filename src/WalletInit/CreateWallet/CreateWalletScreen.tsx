import {RouteProp, useNavigation, useRoute} from '@react-navigation/native'
import assert from 'assert'
import React from 'react'
import {SafeAreaView} from 'react-native-safe-area-context'

import {generateAdaMnemonic} from '../../legacy/commonUtils'
import {WalletInitRouteNavigation, WalletInitRoutes} from '../../navigation'
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
    const {networkId, walletImplementationId, provider} = route.params

    assert(!!formData?.name, 'Wallet name is required')
    assert(!!formData?.password, 'Password is required')

    navigation.navigate('mnemoinc-show', {
      mnemonic,
      networkId,
      walletImplementationId,
      provider,
      ...formData,
    })
  }

  return (
    <SafeAreaView style={{flex: 1}} edges={['left', 'right', 'bottom']}>
      <WalletForm onSubmit={setFormData} />
      <MnemonicExplanationModal
        visible={visibleMnemonicExplanation}
        onRequestClose={hideMnemonicExplanation}
        onConfirm={navigateToMnemonicScreen}
      />
    </SafeAreaView>
  )
}
