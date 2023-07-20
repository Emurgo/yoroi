import {storiesOf} from '@storybook/react-native'
import React from 'react'
import {StyleSheet, View} from 'react-native'

import {Icon} from '../../../../../components'
import {COLORS} from '../../../../../theme'
import {SelectPoolList} from './index'

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
})
storiesOf('Swap List Pool', module)
  .addDecorator((story) => <View style={styles.container}>{story()}</View>)
  .add('initial', () => (
    <SelectPoolList
      data={[
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
      ]}
    />
  ))
