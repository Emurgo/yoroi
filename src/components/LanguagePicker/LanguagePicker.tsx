import React from 'react'
import {defineMessages, useIntl} from 'react-intl'
import {StyleSheet, View, ViewProps} from 'react-native'

import {useLanguage} from '../../i18n'
import {Button} from '../Button'
import {StandardModal} from '../StandardModal'
import {Text} from '../Text'
import {LanguagePickerList} from './LanguagePickerList'

export const Row = ({style, ...props}: ViewProps) => <View {...props} style={[styles.row, style]} />

export const LanguagePicker = ({onPressConfirmButtonCallback, buttonLabel}: Props) => {
  const languageContext = useLanguage()
  const {languageCode, selectLanguageCode, supportedLanguages} = languageContext
  const [languageCodeSelected, setLanguageCodeSelected] = React.useState<string>(languageCode)
  const [showDialog, setShowDialog] = React.useState<boolean>(false)
  const strings = useStrings()

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
            onPress={() => setShowDialog(true)}
          />
        </Row>
      </View>

      <StandardModal
        onRequestClose={() => setShowDialog(false)}
        title={strings.modalTitle}
        visible={showDialog}
        primaryButton={{
          label: strings.modalPrimaryButtonLabel.toLocaleUpperCase(),
          onPress: () => {
            selectLanguageCode(languageCodeSelected)
            setShowDialog(false)
            if (onPressConfirmButtonCallback) onPressConfirmButtonCallback()
          },
        }}
        secondaryButton={{
          label: strings.modalSecondaryButtonLabel.toLocaleUpperCase(),
          onPress: () => setShowDialog(false),
        }}
      >
        <Text>{strings.modalText(supportedLanguages.find((l) => l.code === languageCodeSelected)?.label)}</Text>
      </StandardModal>
    </>
  )
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  container: {
    position: 'relative',
    flex: 1,
  },
  buttonRow: {
    position: 'absolute',
    bottom: 0,
  },
})

const useStrings = () => {
  const intl = useIntl()

  return {
    modalTitle: intl.formatMessage(messages.modalTitle),
    modalPrimaryButtonLabel: intl.formatMessage(messages.modalPrimaryButtonLabel),
    modalSecondaryButtonLabel: intl.formatMessage(messages.modalSecondaryButtonLabel),
    modalText: (languageLabel) => intl.formatMessage(messages.modalText, {languageLabel}),
  }
}

const messages = defineMessages({
  modalTitle: {
    id: 'components.common.languagepicker.modal.modalTitle',
    defaultMessage: '!!!Change language',
  },
  modalPrimaryButtonLabel: {
    id: 'components.common.languagepicker.modal.modalPrimaryButtonLabel',
    defaultMessage: '!!!Confirm',
  },
  modalSecondaryButtonLabel: {
    id: 'components.common.languagepicker.modal.modalSecondaryButtonLabel',
    defaultMessage: '!!!Cancel',
  },
  modalText: {
    id: 'components.common.languagepicker.modal.modalText',
    defaultMessage: '!!!Confirm changing your wallet to {languageLabel}?',
  },
})

type Props = {
  onPressConfirmButtonCallback?: () => void
  buttonLabel: string
}
