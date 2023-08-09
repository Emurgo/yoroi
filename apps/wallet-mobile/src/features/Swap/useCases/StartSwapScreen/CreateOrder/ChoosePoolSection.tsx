import React from 'react'

import {useNavigateTo} from '../../../common/navigation'
import {ExpandableInfoCard} from '../../../common/SelectPool/ExpendableCard'
import {useStrings} from '../../../common/strings'

export const ChoosePoolSection = () => {
  const navigate = useNavigateTo()
  const strings = useStrings()
  return (
    <ExpandableInfoCard
      label="Minswap (Auto)"
      mainInfo={[{label: 'Total 11 ADA'}]}
      navigateTo={() => navigate.selectPool()}
      hiddenInfo={[
        {
          label: 'Min ADA',
          value: '2 ADA', // TODO add real value
          info: strings.swapMinAda,
        },
        {
          label: 'Min Received',
          value: '2.99 USDA', // TODO add real value
          info: strings.swapMinReceived,
        },
        {
          label: 'Fees',
          value: '2 ADA', // TODO add real value
          info: strings.swapFees,
        },
      ]}
    />
  )
}
