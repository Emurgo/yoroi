import {atoms as a, useTheme} from '@yoroi/theme'
import React from 'react'
import {ScrollView} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'

import {useLanguage} from '../../../../../kernel/i18n/LanguageProvider'
import {TermsOfService} from '../../../../Legal/TermsOfService/TermsOfService'

export const TermsOfServiceScreen = () => {
  const {atoms: ta} = useTheme()
  const {languageCode} = useLanguage()

  return (
    <SafeAreaView
      edges={['left', 'right', 'bottom']}
      style={[ta.bg_color_max, a.flex_1]}
    >
      <ScrollView contentContainerStyle={[a.p_lg]}>
        <TermsOfService languageCode={languageCode} />
      </ScrollView>
    </SafeAreaView>
  )
}
