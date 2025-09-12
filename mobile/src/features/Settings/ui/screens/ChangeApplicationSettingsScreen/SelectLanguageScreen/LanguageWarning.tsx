import {atoms as a, useTheme} from '@yoroi/theme'

import * as React from 'react'
import {TouchableOpacity, View} from 'react-native'
import Markdown from 'react-native-marked'

import {useStrings} from '~/kernel/i18n/useStrings'
import {Icon} from '~/ui/Icon'

export const LanguageWarning = ({enabled}: {enabled?: boolean}) => {
  const strings = useStrings()
  const {atoms: ta, basePalette} = useTheme()
  const [dismissed, setDismissed] = React.useState(false)

  if (!enabled) return null
  if (dismissed) return null

  const contributors =
    strings.languagePicker.contributors !== '_'
      ? `${strings.languagePicker.warning}: **${strings.languagePicker.contributors}**`
      : `${strings.languagePicker.warning}.`

  return (
    <View style={[a.p_lg, a.rounded_sm, ta.bg_color_min]}>
      <View style={[a.flex_row, a.justify_end, a.align_center]}>
        <TouchableOpacity onPress={() => setDismissed(true)}>
          <Icon.Cross size={24} color={ta.el_gray_max.color} />
        </TouchableOpacity>
      </View>

      <Markdown
        value={contributors}
        colorScheme={basePalette}
        backgroundColor={ta.bg_color_max.backgroundColor}
        styles={{
          paragraph: ta.bg_color_min,
          strong: {
            ...a.body_2_md_medium,
            ...ta.text_gray_medium,
          },
          text: {
            ...a.body_2_md_regular,
            ...ta.text_gray_medium,
          },
        }}
      />
    </View>
  )
}
