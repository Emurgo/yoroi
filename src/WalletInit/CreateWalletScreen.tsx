import {useNavigation, useRoute} from '@react-navigation/native'
import React from 'react'

import Screen from '../../legacy/components/Screen'
import MnemonicExplanationModal from '../../legacy/components/WalletInit/CreateWallet/MnemonicExplanationModal'
import {generateAdaMnemonic} from '../../legacy/crypto/commonUtils'
import {WALLET_INIT_ROUTES} from '../../legacy/RoutesList'
import {WalletForm} from './WalletForm'

export const CreateWalletScreen = () => {
  const navigation = useNavigation()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const route: any = useRoute()
  const [visibleMnemonicExplanation, setVisibleMnemonicExplanation] = React.useState(false)
  const [formData, _setFormData] = React.useState<null | {name: string; password: string}>(null)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const setFormData = (formData: any) => {
    _setFormData(formData)
    setVisibleMnemonicExplanation(true)
  }

  const hideMnemonicExplanation = () => setVisibleMnemonicExplanation(false)

  const clear = () => {
    setVisibleMnemonicExplanation(false)
    _setFormData(null)
  }

  const navigateToMnemonicScreen = () => {
    clear()
    // TODO(v-almonacid): we need to generate mnemonics according to the
    // target network.
    const mnemonic = generateAdaMnemonic()
    const {networkId, walletImplementationId, provider} = route.params
    navigation.navigate(WALLET_INIT_ROUTES.MNEMONIC_SHOW, {
      mnemonic,
      networkId,
      walletImplementationId,
      provider,
      ...formData,
    })
  }

  return (
    <Screen>
      <WalletForm onSubmit={setFormData} />
      <MnemonicExplanationModal
        visible={visibleMnemonicExplanation}
        onRequestClose={hideMnemonicExplanation}
        onConfirm={navigateToMnemonicScreen}
      />
    </Screen>
  )
}
