import {useTheme} from '@yoroi/theme'
import React, {useState} from 'react'
import {defineMessages, useIntl} from 'react-intl'
import {StyleSheet, TouchableOpacity, View} from 'react-native'
import Markdown from 'react-native-markdown-display'

import {Icon} from '../Icon'

export const LanguagePickerWarning = ({enabled}: {enabled: boolean}) => {
  const strings = useStrings()
  const {styles, colors} = useStyles()
  const [dismissed, setDismissed] = useState(false)

  if (!enabled) return null
  if (dismissed) return null

  return (
    <View style={styles.dialog}>
      <View style={styles.dialogSquare}>
        <View style={styles.row}>
          <TouchableOpacity onPress={() => setDismissed(true)}>
            <Icon.Cross size={24} color={colors.icon} />
          </TouchableOpacity>
        </View>

        {/* @ts-expect-error old react */}
        <Markdown style={{text: styles.markdownText, body: styles.markdownText}}>
          {strings.contributors !== '_' ? `${strings.warning}: **${strings.contributors}**` : `${strings.warning}.`}
        </Markdown>
      </View>
    </View>
  )
}

const useStyles = () => {
  const {atoms, color} = useTheme()
  const styles = StyleSheet.create({
    dialog: {
      ...atoms.p_lg,
    },
    dialogSquare: {
      backgroundColor: color.bg_color_low,
      borderRadius: 8,
      ...atoms.p_lg,
    },
    row: {
      ...atoms.flex_row,
      ...atoms.justify_end,
      ...atoms.align_center,
    },
    markdownText: {
      ...atoms.body_1_lg_regular,
      color: color.text_gray_normal,
    },
  })

  const colors = {
    icon: color.el_gray_high,
  }

  return {styles, colors} as const
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
