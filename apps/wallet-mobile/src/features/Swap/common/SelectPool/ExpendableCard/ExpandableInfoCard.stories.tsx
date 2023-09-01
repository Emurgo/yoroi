import {storiesOf} from '@storybook/react-native'
import React from 'react'
import {StyleSheet, Text, View} from 'react-native'

import {Icon, Spacer} from '../../../../../components'
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
      mainInfo={[{label: 'Total 11 ADA'}]}
      hiddenInfo={[
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
  .add('with primary info', () => (
    <ExpandableInfoCard
      label={
        <View style={{flexDirection: 'row', alignItems: 'center'}}>
          <Icon.YoroiNightly size={24} />

          <Spacer width={4} />

          <Text>ADA/</Text>

          <Spacer width={4} />

          <Icon.Assets size={24} />

          <Spacer width={4} />

          <Text>USDA</Text>
        </View>
      }
      mainInfo={[
        {label: 'Token price', value: '3 ADA'},
        {label: 'Token amount', value: '3 USDA'},
      ]}
      hiddenInfo={[
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
  .add('with primary info and button', () => (
    <ExpandableInfoCard
      label={
        <View style={{flexDirection: 'row', alignItems: 'center'}}>
          <Icon.YoroiNightly size={24} />

          <Spacer width={4} />

          <Text>ADA/</Text>

          <Spacer width={4} />

          <Icon.Assets size={24} />

          <Spacer width={4} />

          <Text>USDA</Text>
        </View>
      }
      mainInfo={[
        {label: 'Token price', value: '3 ADA'},
        {label: 'Token amount', value: '3 USDA'},
      ]}
      hiddenInfo={[
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
      buttonAction={() => {
        console.log('button pressed')
      }}
      buttonText="CANCEL ORDER"
      withBoxShadow
    />
  ))
