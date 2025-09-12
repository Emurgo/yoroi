import {atoms as a} from '@yoroi/theme'

import * as React from 'react'
import {SafeAreaView} from 'react-native-safe-area-context'

import {TermsOfService} from '~/features/Legal/ui/shared/TermsOfService/TermsOfService'
import {useLanguage} from '~/kernel/i18n/LanguageProvider'

export const ReadTermsOfServiceScreen = () => {
  const {languageCode} = useLanguage()

  return (
    <SafeAreaView
      edges={['left', 'right', 'bottom']}
      style={[a.flex_1, a.px_lg]}
    >
      <TermsOfService languageCode={languageCode} />
    </SafeAreaView>
  )
}
