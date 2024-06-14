import {storiesOf} from '@storybook/react-native'
import React, {useState} from 'react'
import {StyleSheet, Text, View} from 'react-native'

import {Accordion} from './Accordion'

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
})
storiesOf('Accordion', module)
  .addDecorator((story) => <View style={styles.container}>{story()}</View>)
  .add('Single', () => {
    const [active, setActive] = useState(false)

    return (
      <Accordion label="Accordion Label" expanded={active} onChange={setActive}>
        <MainInfo />
      </Accordion>
    )
  })

const MainInfo = () => {
  return (
    <View>
      <Text>This is the content of accordion</Text>
    </View>
  )
}
