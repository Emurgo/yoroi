import React from 'react'

import {LanguageProvider} from '@yoroi/wallet-mobile/src/i18n'

export const withIntl = (storyFn) => <LanguageProvider>{storyFn()}</LanguageProvider>
