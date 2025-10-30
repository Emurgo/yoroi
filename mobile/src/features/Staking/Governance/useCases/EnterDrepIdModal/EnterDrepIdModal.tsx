import {isNonNullable} from '@yoroi/common'
import {useGovernance, useIsValidDRepID} from '@yoroi/staking'
import {atoms as a, useTheme} from '@yoroi/theme'

import * as React from 'react'
import {Alert, Linking, Text} from 'react-native'

import {useStrings} from '~/kernel/i18n/useStrings'
import {Button} from '~/ui/Button/Button'
import {useModal} from '~/ui/Modal/context/ModalContext'
import {Modal} from '~/ui/Modal/ui/screens/Modal/Modal'
import {Space} from '~/ui/Space/Space'
import {TextInput} from '~/ui/TextInput/TextInput'

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
  const {closeModal} = useModal()
  const {manager} = useGovernance()

  const {error, isFetched, isFetching} = useIsValidDRepID(drepId, {
    retry: false,
    enabled: drepId.length > 0,
  })

  const handleOnPress = async () => {
    try {
      const {hash, type, isValid} = await manager.validateAndParseDRepID(drepId)
      if (!isValid) {
        throw new Error('Invalid DRep ID')
      }
      onSubmit?.({hash, type, CIP105: !error && drepId.length === 56})
      closeModal()
    } catch (e) {
      Alert.alert(strings.global.error, strings.staking.invalidDRepId)
    }
  }

  const handleOnLinkPress = () => {
    Linking.openURL(FIND_DREPS_LINK)
  }

  return (
    <Modal.Content>
      <Space.Height.sm />

      <Text style={[a.text_center, a.body_1_lg_regular, ta.text_gray_medium]}>
        {strings.staking.enterDrepIDInfo}
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
            {strings.staking.findDRepHere}
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
        label={strings.staking.drepID}
        numberOfLines={2}
        focusable
        containerStyle={{minHeight: 80}}
        renderComponentStyle={{
          ...a.pt_lg,
          ...a.pb_lg,
          ...a.pl_lg,
          ...a.pr_lg,
          ...a.body_1_lg_regular,
          minHeight: 70,
        }}
      />

      <Space.Height.sm fill />

      <Button
        title={strings.staking.confirm}
        disabled={
          isNonNullable(error) ||
          drepId.length === 0 ||
          !isFetched ||
          isFetching
        }
        onPress={handleOnPress}
      />
    </Modal.Content>
  )
}
