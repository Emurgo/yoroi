import {useSwap} from '@yoroi/swap'
import React from 'react'

import {useNavigateTo} from '../../../../common/navigation'
import {ExpandableInfoCard} from '../../../../common/SelectPool/ExpendableCard/ExpandableInfoCard'
import {useStrings} from '../../../../common/strings'

export const ShowPoolActions = () => {
  const navigate = useNavigateTo()
  const strings = useStrings()
  const {createOrder} = useSwap()
  const {selectedPool} = createOrder

  if (selectedPool === undefined) {
    return <></>
  }

  const protocolCapitalize = selectedPool.provider[0].toUpperCase() + selectedPool.provider.substring(1)

  return (
    <ExpandableInfoCard
      label={`${protocolCapitalize} (auto)`}
      mainInfo={[{label: 'Total 11 ADA ?'}]}
      navigateTo={() => navigate.selectPool()}
      hiddenInfo={[
        {
          label: 'Min ADA',
          value: '2 ADA', // TODO add real value
          info: strings.swapMinAda,
        },
        {
          label: 'Min Received ?',
          value: '2.99 USDA', // TODO add real value
          info: strings.swapMinReceived,
        },
        {
          label: 'Fees',
          value: selectedPool?.fee, // waiting for more clarification if show the fee or the ada value
          info: strings.swapFees,
        },
      ]}
    />
  )
}
