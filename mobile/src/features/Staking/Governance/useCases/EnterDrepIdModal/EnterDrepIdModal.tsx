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

export const HEIGHT_WITH_CARD = 660
export const HEIGHT_WITHOUT_CARD = 350

const FIND_DREPS_LINKS: Record<Chain.SupportedNetworks, string> = {
  [Chain.Network.Preprod]: 'https://preprod.cexplorer.io/drep',
  [Chain.Network.Mainnet]: 'https://beta.cexplorer.io/drep',
  [Chain.Network.Preview]: 'https://preview.cexplorer.io/drep',
}

export const EnterDrepIdModal = ({onSubmit}: Props) => {
  const strings = useStrings()
  const {closeModal, setHeight} = useModal()
  const {wallet} = useSelectedWallet()
  const network = wallet.networkManager.network

  const [showCard, setShowCard] = React.useState(true)
  const [drepIdSelected, setDrepIdSelected] = React.useState('')
  const timeoutRef = React.useRef<ReturnType<typeof setTimeout>>(undefined)

  React.useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [])

  const scheduleHeightChange = React.useCallback(
    (height: number) => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      timeoutRef.current = setTimeout(() => setHeight(height), 150)
    },
    [setHeight],
  )

  const handleFocus = React.useCallback(() => {
    setShowCard(false)
    scheduleHeightChange(HEIGHT_WITHOUT_CARD)
  }, [scheduleHeightChange])

  const handleBlur = React.useCallback(() => {
    if (drepIdSelected.length === 0) {
      setShowCard(true)
      scheduleHeightChange(HEIGHT_WITH_CARD)
    }
  }, [drepIdSelected.length, scheduleHeightChange])

  const handleDrepIdChange = React.useCallback(
    (text: string) => setDrepIdSelected(text),
    [],
  )

  const {error, isFetched, isFetching} = useIsValidDRepID(drepIdSelected, {
    retry: false,
    enabled: drepIdSelected.length > 0,
  })

  const isSubmitDisabled =
    isNonNullable(error) ||
    drepIdSelected.length === 0 ||
    !isFetched ||
    isFetching

  const handleSubmit = () => {
    try {
      const {hash, type} = parseDrepId(drepIdSelected, CardanoMobile)
      const isCIP105 = !error && drepIdSelected.length === 56
      onSubmit?.({hash, type, CIP105: isCIP105})
      closeModal()
    } catch {
      Alert.alert(strings.global.error, strings.staking.invalidDRepId)
    }
  }

  const handleFindDRepLink = () => Linking.openURL(FIND_DREPS_LINKS[network])

  const handleDelegateToYoroi = () => {
    onSubmit?.({hash: getYoroiDrepIdHex(network), type: 'key', CIP105: false})
    closeModal()
  }

  return (
    <Modal.Content>
      <Space.Height.sm />

      <Description />

      <Space.Height.lg />

      <TextInput
        value={drepIdSelected}
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
        <FindDRepSection
          onLinkPress={handleFindDRepLink}
          onDelegateToYoroi={handleDelegateToYoroi}
        />
      )}

      <Space.Height.lg />

      <Button
        title={strings.staking.confirm}
        disabled={isSubmitDisabled}
        onPress={handleSubmit}
      />
    </Modal.Content>
  )
}

const Description = () => {
  const strings = useStrings()
  const {atoms: ta} = useTheme()

  return (
    <Text style={[a.text_center, a.body_1_lg_regular, ta.text_gray_medium]}>
      {strings.staking.enterDrepIDInfo}
    </Text>
  )
}

type FindDRepSectionProps = {
  onLinkPress: () => void
  onDelegateToYoroi: () => void
}

const FindDRepSection = ({
  onLinkPress,
  onDelegateToYoroi,
}: FindDRepSectionProps) => {
  const strings = useStrings()
  const {atoms: ta, palette} = useTheme()

  return (
    <>
      <Space.Height.lg />

      <View style={[a.flex_row, a.justify_center, a.flex_wrap]}>
        <Text style={[a.body_1_lg_regular, ta.text_gray_medium, a.text_center]}>
          {strings.staking.dontHaveAnID}{' '}
        </Text>

        <Text
          style={[
            a.body_1_lg_regular,
            {color: palette.primary_500, textDecorationLine: 'underline'},
          ]}
          onPress={onLinkPress}
        >
          {strings.staking.findDRepHere}
        </Text>
      </View>

      <Space.Height.xs />

      <Text style={[a.body_1_lg_regular, ta.text_gray_medium, a.text_center]}>
        {strings.staking.orDelegateToYoroiDrepBelow}
      </Text>

      <Space.Height.lg />

      <YoroiDrepCard
        onDelegate={onDelegateToYoroi}
        truncateId
        variant="plain"
      />
    </>
  )
}
