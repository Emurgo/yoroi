import React from 'react'
import {View} from 'react-native'

import {useLanguage} from '../../i18n'
import {Button} from '../Button'
import {List} from '../List'

export const LanguagePicker = () => {
  const languageContext = useLanguage()

  const {languageCode, /*  selectLanguageCode,  */ supportedLanguages} = languageContext
  const [languageCodeSelected, setLanguageCodeSelected] = React.useState<string>(languageCode)

  return (
    <View style={{position: 'relative', flex: 1}}>
      <List
        data={supportedLanguages.map((l) => ({id: l.code, text: l.label}))}
        idSelected={languageCodeSelected}
        setIdSelected={setLanguageCodeSelected}
        withSearch={false}
      />
      <View style={{position: 'absolute', bottom: 0, alignItems: 'center', width: '100%'}}>
        <Button title="TEST" />
      </View>
    </View>
  )
}
