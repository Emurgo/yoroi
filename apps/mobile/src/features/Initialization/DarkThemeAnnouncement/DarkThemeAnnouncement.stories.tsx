import {storiesOf} from '@storybook/react-native'
import {useTheme} from '@yoroi/theme'
import React from 'react'
import {StyleSheet, View} from 'react-native'

import {DarkThemeAnnouncement} from './DarkThemeAnnouncement'

storiesOf('Inital DarkThemeAnnouncementScreen', module)
  .addDecorator((story) => {
    const styles = useStyles()
    return <View style={styles.container}>{story()}</View>
  })
  .add('initial', () => <DarkThemeAnnouncement />)

const useStyles = () => {
  const {color} = useTheme()
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      padding: 16,
      backgroundColor: color.bg_color_max,
    },
  })

  return styles
}
