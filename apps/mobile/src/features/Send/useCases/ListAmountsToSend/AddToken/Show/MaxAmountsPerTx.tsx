import {useTheme} from '@yoroi/theme'
import * as React from 'react'
import {Text} from 'react-native'

import {limitOfSecondaryAmountsPerTx} from '~/features/SetupWallet/common/constants'
import {useStrings} from '~/kernel/i18n/useStrings'
import {ErrorPanel} from '~/ui/ErrorPanel/ErrorPanel'

export const MaxAmountsPerTx = () => {
  const strings = useStrings()
  const theme = useTheme()

  return (
    <ErrorPanel>
      <Text
        style={[theme.atoms.body_2_md_regular, {color: theme.color.gray_max}]}
      >
        <Text
          style={theme.atoms.body_2_md_medium}
        >{`${limitOfSecondaryAmountsPerTx} ${strings.send.assets.toLocaleLowerCase()} `}</Text>

        {strings.send.maxAmountsPerTx}
      </Text>
    </ErrorPanel>
  )
}
