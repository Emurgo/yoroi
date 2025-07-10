import {isNonNullable} from '@yoroi/common'
import {parseDrepId, useIsValidDRepID} from '@yoroi/staking'
import {atoms as a, useTheme} from '@yoroi/theme'
import React from 'react'
import {Alert, Linking, Text, View} from 'react-native'

import {Button} from '../../../../../ui/Button/Button'
import {Space} from '../../../../../ui/Space/Space'
import {TextInput} from '../../../../../ui/TextInput/TextInput'
import {CardanoMobile} from '../../../../../wallets/wallets'
import {useStrings} from '../../common/strings'

export type Props = {
  onSubmit?: (options: {
    type: 'key' | 'script'
    hash: string
    CIP105: boolean
  }) => void
}

const FIND_DREPS_LINK = ''

export const EnterDrepIdModal = ({onSubmit}: Props) => {
  const strings = useStrings()
  const {atoms: ta, palette: p} = useTheme()
  const [drepId, setDrepId] = React.useState('')

  const {error, isFetched, isFetching} = useIsValidDRepID(drepId, {
    retry: false,
    enabled: drepId.length > 0,
  })

  const handleOnPress = () => {
    try {
      const {hash, type} = parseDrepId(drepId, CardanoMobile)
      onSubmit?.({hash, type, CIP105: !error && drepId.length === 56})
    } catch (e) {
      Alert.alert(strings.error, strings.invalidDRepId)
    }
  }

  const handleOnLinkPress = () => {
    Linking.openURL(FIND_DREPS_LINK)
  }

  return (
    <View style={[a.flex_1, a.px_lg]}>
      <Space.Height.sm />

      <Text style={[a.text_center, a.body_1_lg_regular, ta.text_gray_medium]}>
        {strings.enterDrepIDInfo}
      </Text>

      {FIND_DREPS_LINK.length > 0 && (
        <>
          <Space.Height.lg />

          <Text
            style={[
              a.text_center,
              a.body_1_lg_regular,
              {color: p.primary_500, textDecorationLine: 'underline'},
            ]}
            onPress={handleOnLinkPress}
          >
            {strings.findDRepHere}
          </Text>
        </>
      )}

      <Space.Height.lg />

      <TextInput
        value={drepId}
        onChangeText={(text) => setDrepId(text)}
        multiline
        errorDelay={1000}
        errorText={error?.message}
        label={strings.drepID}
        numberOfLines={2}
        focusable
        containerStyle={{minHeight: 80}}
        renderComponentStyle={[
          a.pt_lg,
          a.pb_lg,
          a.pl_lg,
          a.pr_lg,
          a.body_1_lg_regular,
          {minHeight: 70},
        ]}
      />

      <Space.Height.sm fill />

      <Button
        title={strings.confirm}
        disabled={
          isNonNullable(error) ||
          drepId.length === 0 ||
          !isFetched ||
          isFetching
        }
        onPress={handleOnPress}
      />

      <Space.Height.lg />
    </View>
  )
}
