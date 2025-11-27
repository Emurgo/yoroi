import {isNonNullable} from '@yoroi/common'
import {
  GOVERNANCE_YOROI_DREP_ID_HEX,
  parseDrepId,
  useIsValidDRepID,
} from '@yoroi/staking'
import {atoms as a, useTheme} from '@yoroi/theme'

import * as React from 'react'
import {Alert, Linking, Text, View} from 'react-native'

import {useStrings} from '~/kernel/i18n/useStrings'
import {Button} from '~/ui/Button/Button'
import {useModal} from '~/ui/Modal/context/ModalContext'
import {Modal} from '~/ui/Modal/ui/screens/Modal/Modal'
import {Space} from '~/ui/Space/Space'
import {TextInput} from '~/ui/TextInput/TextInput'
import {CardanoMobile} from '~/wallets/wallets'

import {YoroiDrepCard} from '../../common/YoroiDrepCard/YoroiDrepCard'

export type Props = {
  onSubmit?: (options: {
    type: 'key' | 'script'
    hash: string
    CIP105: boolean
  }) => void
}

const FIND_DREPS_LINK = 'https://beta.cexplorer.io/drep'

const HEIGHT_WITH_CARD = 650
const HEIGHT_WITHOUT_CARD = 340

export const EnterDrepIdModal = ({onSubmit}: Props) => {
  const strings = useStrings()
  const {atoms: ta, palette: p} = useTheme()
  const [drepId, setDrepId] = React.useState('')
  const {closeModal, setHeight} = useModal()

  const {error, isFetched, isFetching} = useIsValidDRepID(drepId, {
    retry: false,
    enabled: drepId.length > 0,
  })

  const showYoroiDrepOption = drepId.length === 0

  React.useEffect(() => {
    setHeight(showYoroiDrepOption ? HEIGHT_WITH_CARD : HEIGHT_WITHOUT_CARD)
  }, [showYoroiDrepOption, setHeight])

  const handleOnPress = () => {
    try {
      const {hash, type} = parseDrepId(drepId, CardanoMobile)
      onSubmit?.({hash, type, CIP105: !error && drepId.length === 56})
      closeModal()
    } catch (e) {
      Alert.alert(strings.global.error, strings.staking.invalidDRepId)
    }
  }

  const handleOnLinkPress = () => {
    Linking.openURL(FIND_DREPS_LINK)
  }

  const handleDelegateToYoroi = () => {
    onSubmit?.({
      hash: GOVERNANCE_YOROI_DREP_ID_HEX,
      type: 'key',
      CIP105: false,
    })
    closeModal()
  }

  return (
    <Modal.Content>
      <Space.Height.sm />

      <Text style={[a.text_center, a.body_1_lg_regular, ta.text_gray_medium]}>
        {strings.staking.enterDrepIDInfo}
      </Text>

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

      {showYoroiDrepOption && (
        <>
          <Space.Height.lg />

          <View style={[a.flex_row, a.justify_center, a.flex_wrap]}>
            <Text
              style={[a.body_1_lg_regular, ta.text_gray_medium, a.text_center]}
            >
              {strings.staking.dontHaveAnID}{' '}
            </Text>

            <Text
              style={[
                a.body_1_lg_regular,
                {color: p.primary_500, textDecorationLine: 'underline'},
              ]}
              onPress={handleOnLinkPress}
            >
              {strings.staking.findDRepHere}
            </Text>
          </View>

          <Space.Height.xs />

          <Text
            style={[a.body_1_lg_regular, ta.text_gray_medium, a.text_center]}
          >
            {strings.staking.orDelegateToYoroiDrepBelow}
          </Text>

          <Space.Height.lg />

          <YoroiDrepCard
            onDelegate={handleDelegateToYoroi}
            truncateId
            variant="plain"
          />
        </>
      )}

      <Space.Height.lg />

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
