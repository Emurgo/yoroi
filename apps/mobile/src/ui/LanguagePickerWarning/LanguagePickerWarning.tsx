import {useTheme} from '@yoroi/theme'
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
    <View
      style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 16,
      }}
    >
      <View
        style={[
          {
            borderRadius: 8,
            padding: 16,
          },
          {backgroundColor: p.bg_color_min},
        ]}
      >
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'flex-end',
            marginBottom: 8,
          }}
        >
          <TouchableOpacity onPress={() => setDismissed(true)}>
            <Icon.Cross size={24} color={p.el_gray_max} />
          </TouchableOpacity>
        </View>

        <Markdown
          value={
            strings.ui.contributors !== '_'
              ? `${strings.ui.warning}: **${strings.ui.contributors}**`
              : `${strings.ui.warning}.`
          }
          styles={{
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
