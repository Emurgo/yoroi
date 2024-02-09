import {storiesOf} from '@storybook/react-native'
import {useTheme} from '@yoroi/theme'
import React from 'react'
import {Image, StyleSheet, Text, View} from 'react-native'

import banxaLogo from '../../../../../assets/img/banxa.png'
import {ContentResult} from './ContentResult'

storiesOf('RampOnOff ShowContentResult', module)
  .addDecorator((story) => {
    const styles = useStyles()
    return <View style={styles.container}>{story()}</View>
  })
  .add('initial', () => {
    const styles = useStyles()
    return (
      <ContentResult title="Provider">
        <View style={styles.boxProvider}>
          <Image style={styles.banxaLogo} source={banxaLogo} />

          <Text style={styles.contentValueText}>Banxa</Text>
        </View>
      </ContentResult>
    )
  })

const useStyles = () => {
  const {theme} = useTheme()
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      padding: 16,
    },
    boxProvider: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    contentValueText: {
      ...theme.typography['body-1-regular'],
      color: '#000000',
    },
    banxaLogo: {
      width: 24,
      height: 24,
    },
  })

  return styles
}
