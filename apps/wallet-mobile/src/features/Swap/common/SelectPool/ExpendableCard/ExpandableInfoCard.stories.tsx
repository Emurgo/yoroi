import {action} from '@storybook/addon-actions'
import {storiesOf} from '@storybook/react-native'
import React from 'react'
import {StyleSheet, Text, View} from 'react-native'

import {Icon, Spacer} from '../../../../../components'
import {ExpandableInfoCard, MainInfoWrapper} from './ExpandableInfoCard'

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
      mainInfo={<MainInfo />}
      hiddenInfo={[
        {
          label: 'Min ADA',
          value: '2 ADA',
          info: 'Fake content',
        },
        {
          label: 'Min Received',
          value: '2.99 USDA',
          info: 'Fake content',
        },
        {
          label: 'Fees',
          value: '2 ADA',
          info: 'Fake content',
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
      mainInfo={<MainInfo />}
      hiddenInfo={[
        {
          label: 'Min ADA',
          value: '2 ADA',
          info: 'Fake content',
        },
        {
          label: 'Min Received',
          value: '2.99 USDA',
          info: 'Fake content',
        },
        {
          label: 'Fees',
          value: '2 ADA',
          info: 'Fake content',
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
      mainInfo={<MainInfo />}
      hiddenInfo={[
        {
          label: 'Min ADA',
          value: '2 ADA',
          info: 'Fake content',
        },
        {
          label: 'Min Received',
          value: '2.99 USDA',
          info: 'Fake content',
        },
        {
          label: 'Fees',
          value: '2 ADA',
          info: 'Fake content',
        },
      ]}
      onPress={() => {
        action('onClose')
      }}
      buttonLabel="CANCEL ORDER"
      withBoxShadow
    />
  ))

const MainInfo = () => {
  return [
    {label: 'Token price', value: '3 ADA'},
    {label: 'Token amount', value: '3 USDA'},
  ].map((item, index) => <MainInfoWrapper key={index} label={item.label} value={item.value} isLast={index === 1} />)
}
