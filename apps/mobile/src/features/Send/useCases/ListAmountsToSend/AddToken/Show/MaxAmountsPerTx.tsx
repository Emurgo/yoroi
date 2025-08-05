import {useTheme} from '@yoroi/theme'
import * as React from 'react'
import {Text} from 'react-native'

import {limitOfSecondaryAmountsPerTx} from '~/features/Send/common/constants'
import {useStrings} from '~/kernel/i18n/useStrings'
import {ErrorPanel} from '~/ui/ErrorPanel/ErrorPanel'

export const MaxAmountsPerTx = () => {
  const strings = useStrings()
  const {palette: p} = useTheme()

  return (
    <ErrorPanel>
      <Text style={[{color: p.gray_max, fontSize: 14, lineHeight: 20}]}>
        <Text
          style={{fontSize: 14, lineHeight: 20, fontWeight: '500'}}
        >{`${limitOfSecondaryAmountsPerTx} `}</Text>

        {strings.send.errorBannerMaxTokenLimit}
      </Text>
    </ErrorPanel>
  )
}
