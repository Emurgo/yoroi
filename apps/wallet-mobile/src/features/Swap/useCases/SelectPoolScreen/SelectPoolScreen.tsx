import React from 'react'
import {ScrollView} from 'react-native'

import {Icon} from '../../../../components'
import {COLORS} from '../../../../theme'
import {PoolCounter} from '../../common/SelectPool/PoolCounter'
import {SelectPoolCard} from '../../common/SelectPool/SelectPoolCard/'

export const SelectPoolScreen = () => {
  const cardData = [
    {
      icon: <Icon.YoroiNightly size={40} color={COLORS.SHELLEY_BLUE} />,
      label: 'Muesliswap',
      info: [
        {label: 'Price, ADA', value: '3.3333 ADA'},
        {label: 'TVL, ADA', value: '2,812,265'},
        {label: 'Pool fee, %', value: '0.3%'},
        {label: 'Batcher fee, ADA', value: '0.95'},
      ],
    },
    {
      icon: <Icon.YoroiNightly size={40} color={COLORS.SHELLEY_BLUE} />,
      label: 'Minswap',
      info: [
        {label: 'Price, ADA', value: '3.3333 ADA'},
        {label: 'TVL, ADA', value: '2,812,265'},
        {label: 'Pool fee, %', value: '0.3%'},
        {label: 'Batcher fee, ADA', value: '0.95'},
      ],
    },
    {
      icon: <Icon.YoroiNightly size={40} color={COLORS.SHELLEY_BLUE} />,
      label: 'Sundaeswap',
      info: [
        {label: 'Price, ADA', value: '3.3333 ADA'},
        {label: 'TVL, ADA', value: '2,812,265'},
        {label: 'Pool fee, %', value: '0.3%'},
        {label: 'Batcher fee, ADA', value: '0.95'},
      ],
    },
  ]

  return (
    <ScrollView>
      <SelectPoolCard data={cardData} />

      <PoolCounter length={cardData?.length} />
    </ScrollView>
  )
}
