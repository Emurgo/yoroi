import {usePoolList} from '@yoroi/swap'
import React from 'react'

import {useNavigateTo} from '../../../common/navigation'
import {ExpandableInfoCard} from '../../../common/SelectPool/ExpendableCard/ExpandableInfoCard'
import {useStrings} from '../../../common/strings'

export const ChoosePoolSection = () => {
  const navigate = useNavigateTo()
  const strings = useStrings()
  const {poolList} = usePoolList({
    tokenA: '8a1cfae21368b8bebbbed9800fec304e95cce39a2a57dc35e2e3ebaa.4d494c4b', // MILK policy and name
    tokenB: '',
  })
  console.log('[Pool List data]', poolList)

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
