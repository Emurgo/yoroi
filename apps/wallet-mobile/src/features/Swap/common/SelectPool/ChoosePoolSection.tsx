import React from 'react'

import {useNavigateTo} from '../../common/navigation'
import {ExpandableInfoCard} from './ExpendableCard'

export const ChoosePoolSection = () => {
  const navigate = useNavigateTo()
  return (
    <ExpandableInfoCard
      label="Minswap (Auto)"
      mainInfo={{label: 'Total', value: '11 ADA'}}
      navigateTo={() => navigate.selectPool()}
      secondaryInfo={[
        {
          label: 'Min ADA',
          value: '2 ADA',
        },
        {
          label: 'Min Received',
          value: '2.99 USDA',
        },
        {
          label: 'Fees',
          value: '2 ADA',
        },
      ]}
    />
  )
}
