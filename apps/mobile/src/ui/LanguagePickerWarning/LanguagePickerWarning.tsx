import {atoms as a, useTheme} from '@yoroi/theme'
import React, {useState} from 'react'
import {defineMessages, useIntl} from 'react-intl'
import {TouchableOpacity, View} from 'react-native'
import Markdown from 'react-native-markdown-display'

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
        style={[a.p_lg, {borderRadius: 8, backgroundColor: p.bg_color_min}]}
      >
        <View style={[a.flex_row, a.justify_end, a.align_center]}>
          <TouchableOpacity onPress={() => setDismissed(true)}>
            <Icon.Cross size={24} color={p.el_gray_max} />
          </TouchableOpacity>
        </View>

        {/* @ts-expect-error old react */}
        <Markdown
          style={{
            text: [a.body_1_lg_regular, {color: p.text_gray_medium}],
            body: [a.body_1_lg_regular, {color: p.text_gray_medium}],
          }}
        >
          {strings.contributors !== '_'
            ? `${strings.warning}: **${strings.contributors}**`
            : `${strings.warning}.`}
        </Markdown>
      </View>
    </View>
  )
}

const useStrings = () => {
  const intl = useIntl()

  return {
    contributors: intl.formatMessage(messages.contributors),
    warning: intl.formatMessage(messages.warning),
  }
}

const messages = defineMessages({
  warning: {
    id: 'components.common.languagepicker.acknowledgement',
    defaultMessage:
      '!!!**The selected language translation is fully provided by the community**. ' +
      'EMURGO is grateful to all those who have contributed',
  },
  contributors: {
    id: 'components.common.languagepicker.contributors',
    defaultMessage: '_',
  },
})
