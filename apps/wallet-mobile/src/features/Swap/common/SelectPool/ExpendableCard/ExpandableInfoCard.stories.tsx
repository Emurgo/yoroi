import {storiesOf} from '@storybook/react-native'
import React from 'react'
import {StyleSheet, View} from 'react-native'

import {ExpandableInfoCard} from './ExpandableInfoCard'

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
})
storiesOf('Expandable Info Card', module)
  .addDecorator((story) => <View style={styles.container}>{story()}</View>)
  .add('with inital data', () => (
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
  ))
