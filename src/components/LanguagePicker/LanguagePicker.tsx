import React, {useEffect, useState} from 'react'
import {defineMessages, useIntl} from 'react-intl'
import {StyleSheet, TouchableOpacity, View, ViewProps} from 'react-native'
import Markdown from 'react-native-easy-markdown'

import {useLanguage} from '../../i18n'
import {Button} from '../Button'
import {Icon} from '../Icon'
import {LanguagePickerList} from './LanguagePickerList'

const INCLUDED_LANGUAGE_CODES = ['en-US', 'ja-JP']

export const Row = ({style, ...props}: ViewProps) => <View {...props} style={[styles.row, style]} />

export const LanguagePicker = ({onPressConfirmButtonCallback, buttonLabel, noWarningMessage = false}: Props) => {
  const languageContext = useLanguage()
  const {languageCode, selectLanguageCode, supportedLanguages} = languageContext

  const [languageCodeSelected, setLanguageCodeSelected] = useState<string>(languageCode)
  const [showDialog, setShowDialog] = useState<boolean>(false)

  const strings = useStrings()

  useEffect(() => {
    if (!INCLUDED_LANGUAGE_CODES.includes(languageCode) && !noWarningMessage) setShowDialog(true)
  }, [languageCode, noWarningMessage])

  return (
    <>
      <View style={styles.container}>
        <LanguagePickerList
          data={supportedLanguages.map((l) => ({id: l.code, text: l.label}))}
          idSelected={languageCodeSelected}
          setIdSelected={setLanguageCodeSelected}
          withSearch={false}
        />

        <Row style={styles.buttonRow}>
          <Button
            title={buttonLabel.toLocaleUpperCase()}
            shelleyTheme
            block
            disabled={!languageCodeSelected}
            style={styles.button}
            onPress={() => {
              selectLanguageCode(languageCodeSelected)
              if (onPressConfirmButtonCallback) onPressConfirmButtonCallback()
            }}
          />
        </Row>

        {showDialog && (
          <View style={styles.warningContainer}>
            <View style={styles.warning}>
              <Row style={styles.closeButtonContainer}>
                <TouchableOpacity onPress={() => setShowDialog(false)}>
                  <Icon.Cross size={26} />
                </TouchableOpacity>
              </Row>
              <Markdown markdownStyles={{text: {fontSize: 18}}}>
                {strings.contributors !== '_'
                  ? `${strings.warning}: **${strings.contributors}**`
                  : `${strings.warning}.`}
              </Markdown>
            </View>
          </View>
        )}
      </View>
    </>
  )
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  container: {
    position: 'relative',
    flex: 1,
    alignItems: 'center',
  },
  buttonRow: {
    position: 'absolute',
    bottom: 0,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  warningContainer: {
    width: '100%',
    paddingHorizontal: 16,
    position: 'absolute',
    bottom: 5,
  },
  warning: {
    backgroundColor: '#EAEDF2',
    bottom: 72,
    borderRadius: 8,
    padding: 14,
  },
  closeButtonContainer: {
    justifyContent: 'flex-end',
  },
  button: {
    height: 56,
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

type Props = {
  onPressConfirmButtonCallback?: () => void
  buttonLabel: string
  noWarningMessage?: boolean
}
