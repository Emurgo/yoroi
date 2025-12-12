import {atoms as a, useTheme} from '@yoroi/theme'

import * as React from 'react'
import {View} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'

import {Icon} from '~/ui/Icon'
import {IconProps} from '~/ui/Icon/type'
import {ScrollView} from '~/ui/ScrollView/ScrollView'
import {Text} from '~/ui/Text/Text'

// Icons that require special props and shouldn't be displayed in the gallery
const EXCLUDED_ICONS = ['Direction']

export const IconGallery = () => {
  const {atoms: ta} = useTheme()

  // Get all icon names from the Icon object, excluding special ones
  const iconEntries = React.useMemo(() => {
    return Object.entries(Icon)
      .filter(([name]) => !EXCLUDED_ICONS.includes(name))
      .sort(([a], [b]) => a.localeCompare(b))
      .map(
        ([name, component]) =>
          [name, component as React.ComponentType<IconProps>] as [
            string,
            React.ComponentType<IconProps>,
          ],
      )
  }, [])

  return (
    <SafeAreaView
      edges={['bottom', 'top', 'left', 'right']}
      style={[a.flex_1, ta.bg_color_max]}
    >
      <ScrollView contentContainerStyle={[a.p_lg]}>
        <Text style={[ta.text_gray_max, a.heading_3_medium, a.pb_md]}>
          Icon Gallery
        </Text>

        <View style={[a.flex_row, a.flex_wrap, a.gap_md]}>
          {iconEntries.map(([name, IconComponent]) => (
            <IconItem key={name} name={name} IconComponent={IconComponent} />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const IconItem = ({
  name,
  IconComponent,
}: {
  name: string
  IconComponent: React.ComponentType<IconProps>
}) => {
  const {atoms: ta, palette: p} = useTheme()

  return (
    <View
      style={[
        {
          width: '30%',
          minWidth: 100,
          alignItems: 'center',
          paddingVertical: 16,
          paddingHorizontal: 8,
        },
        ta.bg_color_min,
        a.rounded_md,
        a.gap_xs,
      ]}
    >
      <IconComponent size={32} color={p.gray_900} />
      <Text
        style={[ta.text_gray_max, a.body_3_sm_regular, {textAlign: 'center'}]}
        numberOfLines={2}
      >
        {name}
      </Text>
    </View>
  )
}
