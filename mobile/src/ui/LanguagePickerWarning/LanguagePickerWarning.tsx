import {atoms as a, useTheme} from '@yoroi/theme'

import React, {useState} from 'react'
import {TouchableOpacity, View} from 'react-native'
import Markdown from 'react-native-marked'

import {useStrings} from '~/kernel/i18n/useStrings'
import {Icon} from '~/ui/Icon'

export const LanguagePickerWarning = ({enabled}: {enabled: boolean}) => {
  const strings = useStrings()
  const {palette: p} = useTheme()
  const [dismissed, setDismissed] = useState(false)

  if (!enabled) return null
  if (dismissed) return null

  return (
    <View style={a.p_lg}>
      <View
        style={[
          a.p_lg,
          a.rounded_sm,
            backgroundColor: p.bg_color_min,
        ]}
      >
        <View style={[a.flex_row, a.justify_end, a.align_center]}>
          <TouchableOpacity onPress={() => setDismissed(true)}>
            <Icon.Cross size={24} color={p.el_gray_max} />
          </TouchableOpacity>
        </View>

        <Markdown
          value={
            strings.languagePicker.contributors !== '_'
              ? `${strings.languagePicker.warning}: **${strings.languagePicker.contributors}**`
              : `${strings.languagePicker.warning}.`
          }
          styles={{
            paragraph: {
              backgroundColor: p.bg_color_min,
            },
            text: {
              fontSize: 14,
              lineHeight: 20,
              color: p.text_gray_medium,
            },
          }}
        />
      </View>
    </View>
  )
}
