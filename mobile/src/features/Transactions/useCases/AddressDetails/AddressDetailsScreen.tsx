import {atoms as a} from '@yoroi/theme'

import {useRoute} from '@react-navigation/native'
import {fromPairs} from 'lodash'
import * as React from 'react'

import {AddressContent, AddressFooter} from '~/common/AddressModal/AddressModal'
import {useSelectedWallet} from '@yoroi/wallet-manager/hooks/useSelectedWallet'
import {SafeArea} from '~/ui/SafeArea/SafeArea'
import {ScrollView} from '~/ui/ScrollView/ScrollView'
import {useScrollView} from '~/ui/ScrollView/hooks/useScrollView'

type Params = {
  address: string
}

export const AddressDetailsScreen = () => {
  const {address} = useRoute().params as Params
  const {scrollViewRef} = useScrollView()
  const {wallet} = useSelectedWallet()

  const externalIndex: number | undefined = fromPairs(
    wallet.externalAddresses().map((addr, i) => [addr, i]),
  )[address]
  const internalIndex: number | undefined = fromPairs(
    wallet.internalAddresses().map((addr, i) => [addr, i]),
  )[address]

  const path =
    externalIndex !== undefined
      ? {account: 0, index: externalIndex, role: 0}
      : internalIndex !== undefined
        ? {account: 0, index: internalIndex, role: 1}
        : undefined

  return (
    <SafeArea>
      <ScrollView contentContainerStyle={a.px_lg} ref={scrollViewRef}>
        <AddressContent address={address} path={path} />
      </ScrollView>

      <SafeArea.Footer>
        <AddressFooter address={address} />
      </SafeArea.Footer>
    </SafeArea>
  )
}
