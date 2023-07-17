import React from 'react'

import {ExpandableInfoCard} from './ExpandableInfoCard'

export const SelectPoolCard = () => {
  return (
    <ExpandableInfoCard
      label="Minswap (Auto)"
      mainInfo={{label: 'Total', value: '11 ADA'}}
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
