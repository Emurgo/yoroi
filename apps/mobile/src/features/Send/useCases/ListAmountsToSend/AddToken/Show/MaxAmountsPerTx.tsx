import {atoms as a, useTheme} from '@yoroi/theme'
import * as React from 'react'
import {Text} from 'react-native'

import {limitOfSecondaryAmountsPerTx} from '~/features/Send/common/constants'
import {useStrings} from '~/kernel/i18n/useStrings'
import {ErrorPanel} from '~/ui/ErrorPanel/ErrorPanel'

export const MaxAmountsPerTx = () => {
  const strings = useStrings()
  const {atoms: ta} = useTheme()

  return (
    <ErrorPanel>
      <Text style={[ta.text_gray_max, a.body_3_sm_regular]}>
        <Text style={[a.body_3_sm_medium]}>
          {`${limitOfSecondaryAmountsPerTx} `}
        </Text>

        {strings.send.errorBannerMaxTokenLimit}
      </Text>
    </ErrorPanel>
  )
}
