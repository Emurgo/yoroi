import {atoms as a, useTheme} from '@yoroi/theme'
import React, {useState} from 'react'
import {defineMessages, useIntl} from 'react-intl'
import {StyleSheet, TouchableOpacity, View} from 'react-native'
import Markdown from 'react-native-marked'

import {Icon} from '../Icon'

export const LanguagePickerWarning = ({enabled}: {enabled: boolean}) => {
  const strings = useStrings()
  const {palette: p} = useTheme()
  const [dismissed, setDismissed] = useState(false)

  if (!enabled) return null
  if (dismissed) return null

  return (
    <View style={styles.dialog}>
      <View style={[styles.dialogSquare, {backgroundColor: p.bg_color_min}]}>
        <View style={styles.row}>
          <TouchableOpacity onPress={() => setDismissed(true)}>
            <Icon.Cross size={24} color={p.el_gray_max} />
          </TouchableOpacity>
        </View>

        <Markdown
          value={
            strings.contributors !== '_'
              ? `${strings.warning}: **${strings.contributors}**`
              : `${strings.warning}.`
          }
          styles={{
            text: {...styles.markdownText, ...{color: p.text_gray_medium}},
          }}
        />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  dialog: {
    ...a.p_lg,
  },
  dialogSquare: {
    borderRadius: 8,
    ...a.p_lg,
  },
  row: {
    ...a.flex_row,
    ...a.justify_end,
    ...a.align_center,
  },
  markdownText: {
    ...a.body_1_lg_regular,
  },
})

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
