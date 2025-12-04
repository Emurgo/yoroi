import {isNonNullable} from '@yoroi/common'
import {getYoroiDrepIdHex, parseDrepId, useIsValidDRepID} from '@yoroi/staking'
import {atoms as a, useTheme} from '@yoroi/theme'
import {Chain} from '@yoroi/types'

import * as React from 'react'
import {Alert, Linking, Text, View} from 'react-native'

import {useSelectedWallet} from '~/features/WalletManager/hooks/useSelectedWallet'
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

const FIND_DREPS_LINKS: Record<Chain.SupportedNetworks, string> = {
  [Chain.Network.Preprod]: 'https://preprod.cexplorer.io/drep',
  [Chain.Network.Mainnet]: 'https://beta.cexplorer.io/drep',
  [Chain.Network.Preview]: 'https://preview.cexplorer.io/drep',
}

export const EnterDrepIdModal = ({onSubmit}: Props) => {
  const strings = useStrings()
  const {atoms: ta, palette: p} = useTheme()
  const [drepId, setDrepId] = React.useState('')
  const {closeModal, setHeight} = useModal()
  const {
    wallet: {
      networkManager: {network},
    },
  } = useSelectedWallet()

  const {error, isFetched, isFetching} = useIsValidDRepID(drepId, {
    retry: false,
    enabled: drepId.length > 0,
  })

  const {showCard, handleFocus, handleBlur, updateHasInput} =
    useCardVisibility(setHeight)

  const handleDrepIdChange = (text: string) => {
    setDrepId(text)
    updateHasInput(text)
  }

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
    Linking.openURL(FIND_DREPS_LINKS[network])
  }

  const handleDelegateToYoroi = () => {
    onSubmit?.({
      hash: getYoroiDrepIdHex(network),
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
        onChangeText={handleDrepIdChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
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

      {showCard && (
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

export const HEIGHT_WITH_CARD = 660
export const HEIGHT_WITHOUT_CARD = 350

const useCardVisibility = (setHeight: (height: number) => void) => {
  const [showCard, setShowCard] = React.useState(true)
  const [hasInput, setHasInput] = React.useState(false)
  const timeoutRef = React.useRef<ReturnType<typeof setTimeout>>(undefined)

  React.useEffect(
    () => () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    },
    [],
  )

  const handleFocus = React.useCallback(() => {
    setShowCard(false)
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    timeoutRef.current = setTimeout(() => setHeight(HEIGHT_WITHOUT_CARD), 150)
  }, [setHeight])

  const handleBlur = React.useCallback(() => {
    if (!hasInput) {
      setShowCard(true)
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      timeoutRef.current = setTimeout(() => setHeight(HEIGHT_WITH_CARD), 150)
    }
  }, [hasInput, setHeight])

  const updateHasInput = React.useCallback((text: string) => {
    setHasInput(text.length > 0)
  }, [])

  return {showCard, handleFocus, handleBlur, updateHasInput}
}
