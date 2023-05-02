import React, {useState} from 'react'
import {defineMessages, useIntl} from 'react-intl'
import {StyleSheet, TouchableOpacity, View} from 'react-native'
import Markdown from 'react-native-markdown-display'

import {Icon} from '../Icon'

export const LanguagePickerWarning = ({enabled}: {enabled: boolean}) => {
  const [dismissed, setDismissed] = useState(false)
  const strings = useStrings()

  if (!enabled) return null
  if (dismissed) return null

  return (
    <View style={styles.dialog}>
      <View style={styles.dialogSquare}>
        <View style={styles.row}>
          <TouchableOpacity onPress={() => setDismissed(true)}>
            <Icon.Cross size={26} />
          </TouchableOpacity>
        </View>

        {/* @ts-expect-error old react */}
        <Markdown markdownStyles={{text: styles.markdownText}}>
          {strings.contributors !== '_' ? `${strings.warning}: **${strings.contributors}**` : `${strings.warning}.`}
        </Markdown>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  dialog: {
    padding: 16,
  },
  dialogSquare: {
    backgroundColor: '#EAEDF2',
    borderRadius: 8,
    padding: 14,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  markdownText: {
    fontSize: 18,
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
