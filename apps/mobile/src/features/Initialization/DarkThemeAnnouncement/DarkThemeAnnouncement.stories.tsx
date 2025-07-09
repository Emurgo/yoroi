import {storiesOf} from '@storybook/react-native'
import {atoms as a, useTheme} from '@yoroi/theme'
import React from 'react'
import {View} from 'react-native'

import {DarkThemeAnnouncement} from './DarkThemeAnnouncement'

storiesOf('Inital DarkThemeAnnouncementScreen', module)
  .addDecorator((story) => {
    const {atoms: ta} = useTheme()
    return <View style={[a.flex_1, a.p_lg, ta.bg_color_max]}>{story()}</View>
  })
  .add('initial', () => <DarkThemeAnnouncement />)
