import {invalid} from '@yoroi/common'
import {App} from '@yoroi/types'

import * as React from 'react'
import {IntlProvider} from 'react-intl'
import {Text} from 'react-native'

import {LanguageCode} from './languages'
import {translations} from './translations'

const LanguageContext = React.createContext<undefined | LanguageContext>(
  undefined,
)

export const LanguageProvider = ({
  children,
  storage,
}: React.PropsWithChildren<{
  storage: App.StorageKeyManager<LanguageCode>
}>) => {
  const [selectedLanguageCode, setSelectedLanguageCode] =
    React.useState<LanguageCode>(storage.read())

  const value = React.useMemo(
    () => ({
      languageCode: selectedLanguageCode,
      selectLanguage: (newLanguageCode: LanguageCode) => {
        setSelectedLanguageCode(newLanguageCode)
        storage.save(newLanguageCode)
      },
    }),
    [selectedLanguageCode, storage],
  )

  return (
    <LanguageContext.Provider value={value}>
      <IntlProvider
        locale={selectedLanguageCode}
        messages={translations[selectedLanguageCode]}
        textComponent={Text}
      >
        {children}
      </IntlProvider>
    </LanguageContext.Provider>
  )
}

export const useLanguage = () =>
  React.useContext(LanguageContext) ?? invalid('LanguageProvider is missing')

type LanguageContext = {
  languageCode: LanguageCode
  selectLanguage: (languageCode: LanguageCode) => void
}
