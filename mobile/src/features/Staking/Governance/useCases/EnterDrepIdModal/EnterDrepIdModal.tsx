import {isNonNullable} from '@yoroi/common'
import {getYoroiDrepIdHex, parseDrepId, useIsValidDRepID} from '@yoroi/staking'
import {atoms as a, useTheme} from '@yoroi/theme'
import {Chain} from '@yoroi/types'

import * as React from 'react'
import {Alert, Keyboard, Linking, Text, View} from 'react-native'

import {useSelectedWallet} from '~/features/WalletManager/hooks/useSelectedWallet'
import {useIsKeyboardOpen} from '~/hooks/useIsKeyboardOpen'
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

export const HEIGHT_WITH_CARD = 660
export const HEIGHT_INPUT_FOCUSED = 400
export const HEIGHT_WITHOUT_CARD = 350

export const EnterDrepIdModal = ({onSubmit}: Props) => {
  const strings = useStrings()
  const {atoms: ta, palette: p} = useTheme()
  const [drepId, setDrepId] = React.useState('')
  const [showCard, setShowCard] = React.useState(true)
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

  const timeoutRef = React.useRef<ReturnType<typeof setTimeout>>(undefined)
  const showCardRef = React.useRef(showCard)
  const isInputFocusedRef = React.useRef(false)
  const shouldCloseAfterKeyboardDismissRef = React.useRef(false)
  const isKeyboardOpen = useIsKeyboardOpen()

  React.useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [])

  const requestCloseModal = React.useCallback(() => {
    if (isKeyboardOpen) {
      shouldCloseAfterKeyboardDismissRef.current = true
      Keyboard.dismiss()
      return
    }

    closeModal()
  }, [closeModal, isKeyboardOpen])

  React.useEffect(() => {
    if (!isKeyboardOpen && shouldCloseAfterKeyboardDismissRef.current) {
      shouldCloseAfterKeyboardDismissRef.current = false
      closeModal()
    }
  }, [closeModal, isKeyboardOpen])

  const handleDrepIdChange = React.useCallback(
    (text: string) => {
      setDrepId(text)
      if (text.length > 0 && showCardRef.current) {
        showCardRef.current = false
        setShowCard(false)
        if (timeoutRef.current) clearTimeout(timeoutRef.current)
        timeoutRef.current = setTimeout(
          () => setHeight(HEIGHT_WITHOUT_CARD),
          150,
        )
      } else if (text.length === 0 && !showCardRef.current) {
        showCardRef.current = true
        setShowCard(true)
        if (timeoutRef.current) clearTimeout(timeoutRef.current)
        timeoutRef.current = setTimeout(
          () =>
            setHeight(
              isInputFocusedRef.current
                ? HEIGHT_INPUT_FOCUSED
                : HEIGHT_WITH_CARD,
            ),
          150,
        )
      }
    },
    [setHeight],
  )

  const handleInputFocus = React.useCallback(() => {
    isInputFocusedRef.current = true
    if (showCardRef.current) {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      timeoutRef.current = setTimeout(
        () => setHeight(HEIGHT_INPUT_FOCUSED),
        150,
      )
    }
  }, [setHeight])

  const handleInputBlur = React.useCallback(() => {
    isInputFocusedRef.current = false
    if (showCardRef.current) {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      timeoutRef.current = setTimeout(() => setHeight(HEIGHT_WITH_CARD), 150)
    }
  }, [setHeight])

  const handleOnPress = () => {
    try {
      const {hash, type} = parseDrepId(drepId, CardanoMobile)
      onSubmit?.({hash, type, CIP105: !error && drepId.length === 56})
      requestCloseModal()
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
        onFocus={handleInputFocus}
        onBlur={handleInputBlur}
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
