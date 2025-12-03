import * as React from 'react'

import type {AddressAllocation} from '../types'
import {AirdropMainScreen} from './AirdropMainScreen'
import {DestinationAddressScreen} from './DestinationAddressScreen'

export const AirdropScreen = () => {
  const [selectedAllocation, setSelectedAllocation] =
    React.useState<AddressAllocation | null>(null)

  const handleSelectAddress = (allocation: AddressAllocation) => {
    setSelectedAllocation(allocation)
  }

  const handleBack = () => {
    setSelectedAllocation(null)
  }

  if (selectedAllocation) {
    return (
      <AirdropMainScreen allocation={selectedAllocation} onBack={handleBack} />
    )
  }

  return <DestinationAddressScreen onSelectAddress={handleSelectAddress} />
}
