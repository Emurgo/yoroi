import {action} from '@storybook/addon-actions'
import {storiesOf} from '@storybook/react-native'
import React from 'react'
import {ScrollView, StyleSheet, View} from 'react-native'

import icon from '../../assets/img/icon/dashboard.png'
import {Button} from './Button'

storiesOf('Button', module).add('default', () => (
  <ScrollView>
    <Row>
      <Button onPress={() => action('onPress')()} title="Submit" />
    </Row>

    <Row>
      <Button block onPress={() => action('onPress')()} title="submit" />
    </Row>

    <Row>
      <Button block shelleyTheme onPress={() => action('onPress')()} title="Submit" />
    </Row>

    <Row>
      <Button outlineOnLight block shelleyTheme onPress={() => action('onPress')()} title="Submit" />
    </Row>

    <Row>
      <Button outlineOnLight block onPress={() => action('onPress')()} title="Submit" />
    </Row>

    <Row>
      <Button outlineShelley withoutBackground shelleyTheme block onPress={() => action('onPress')()} title="Submit" />
    </Row>

    <Row>
      <Button block shelleyTheme iconImage={icon} onPress={() => action('onPress')()} title="Submit, with image" />
    </Row>
  </ScrollView>
))

const Row = (props) => <View {...props} style={styles.row} />

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
})
