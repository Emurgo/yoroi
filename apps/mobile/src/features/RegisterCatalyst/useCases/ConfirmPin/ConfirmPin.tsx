import {useMutation, UseMutationOptions} from '@tanstack/react-query'
import {useCatalyst} from '@yoroi/staking'
import {atoms as a, useTheme} from '@yoroi/theme'
import * as React from 'react'
import {ActivityIndicator, ScrollView, View, ViewProps} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'

import {useSelectedWallet} from '~/features/WalletManager/hooks/useSelectedWallet'
import {useStrings} from '~/kernel/i18n/useStrings'
import {useWalletNavigation} from '~/kernel/navigation/hooks/useWalletNavigation'
import {Button} from '~/ui/Button/Button'
import {
  Actions,
  Description,
  PinBox,
  Row,
  Stepper,
} from '~/ui/common/components'
import {BACKSPACE, NumericKeyboard} from '~/ui/NumericKeyboard/NumericKeyboard'
import {Space} from '~/ui/Space/Space'
import {generatePrivateKeyForCatalyst} from '~/wallets/cardano/catalyst'
import {encryptWithPassword} from '~/wallets/cardano/catalyst/catalystCipher'
import {useNavigateTo} from '../CatalystNavigator'
import {useReviewTx} from '../ReviewTx/common/ReviewTxProvider'

export const ConfirmPin = () => {
  const strings = useStrings()
  const {isDark} = useTheme()
  const {palette: p} = useTheme()
  const {pin, votingKeyEncryptedChanged} = useCatalyst()
  const navigateTo = useNavigateTo()
  const [currentActivePin, setCurrentActivePin] = React.useState(1)
  const {wallet, meta} = useSelectedWallet()
  const {unsignedTxChanged} = useReviewTx()
  const {navigateToTxReview} = useWalletNavigation()

  const {generateVotingKeys, isLoading} = useGenerateVotingKeys({
    onSuccess: async ({catalystKeyHex, votingKeyEncrypted}) => {
      votingKeyEncryptedChanged(votingKeyEncrypted)

      let votingRegTx = await wallet.createVotingRegTx({
        catalystKeyHex,
        supportsCIP36: true,
        addressMode: meta.addressMode,
      })

      unsignedTxChanged(votingRegTx.votingRegTx)
      navigateToTxReview({
        onCIP36SupportChange: async (supportsCIP36: boolean) => {
          votingRegTx = await wallet.createVotingRegTx({
            catalystKeyHex,
            supportsCIP36,
            addressMode: meta.addressMode,
          })
          unsignedTxChanged(votingRegTx.votingRegTx)
        },
        onSuccess: navigateTo.qrCode,
      })
    },
  })

  const [pin1Value, setPin1Value] = React.useState<null | string>(null)
  const [pin2Value, setPin2Value] = React.useState<null | string>(null)
  const [pin3Value, setPin3Value] = React.useState<null | string>(null)
  const [pin4Value, setPin4Value] = React.useState<null | string>(null)

  const [pin1Error, setPin1Error] = React.useState(false)
  const [pin2Error, setPin2Error] = React.useState(false)
  const [pin3Error, setPin3Error] = React.useState(false)
  const [pin4Error, setPin4Error] = React.useState(false)

  const [pin1Touched, setPin1Touched] = React.useState(false)
  const [pin2Touched, setPin2Touched] = React.useState(false)
  const [pin3Touched, setPin3Touched] = React.useState(false)
  const [pin4Touched, setPin4Touched] = React.useState(false)

  if (pin === null) throw new Error('pin cannot be null')

  const [pin1, pin2, pin3, pin4] = pin

  const onKeyDown = React.useCallback(
    (key: string) => {
      if (key === BACKSPACE && currentActivePin > 0) {
        setCurrentActivePin(currentActivePin - 1)
        return
      }

      switch (currentActivePin) {
        case 1:
          setPin1Value(key)
          setCurrentActivePin(2)

          if (!pin1Touched) setPin1Touched(true)
          if (key !== pin1) setPin1Error(true)
          else if (pin1Error) setPin1Error(false)

          break

        case 2:
          setPin2Value(key)
          setCurrentActivePin(3)

          if (!pin2Touched) setPin2Touched(true)
          if (key !== pin2) setPin2Error(true)
          else if (pin2Error) setPin2Error(false)

          break

        case 3:
          setPin3Value(key)
          setCurrentActivePin(4)

          if (!pin3Touched) setPin3Touched(true)
          if (key !== pin3) setPin3Error(true)
          else if (pin3Error) setPin3Error(false)

          break

        case 4:
          setPin4Value(key)

          if (!pin4Touched) setPin4Touched(true)
          if (key !== pin4) setPin4Error(true)
          else if (pin4Error) setPin4Error(false)

          break

        default:
          break
      }
    },
    [
      currentActivePin,
      pin1,
      pin1Error,
      pin1Touched,
      pin2,
      pin2Error,
      pin2Touched,
      pin3,
      pin3Error,
      pin3Touched,
      pin4,
      pin4Error,
      pin4Touched,
    ],
  )

  const done = React.useMemo(
    () =>
      pin1Value === pin1 &&
      pin2Value === pin2 &&
      pin3Value === pin3 &&
      pin4Value === pin4 &&
      pin1Touched &&
      pin2Touched &&
      pin3Touched &&
      pin4Touched &&
      !pin1Error &&
      !pin2Error &&
      !pin3Error &&
      !pin4Error,
    [
      pin1,
      pin1Error,
      pin1Touched,
      pin1Value,
      pin2,
      pin2Error,
      pin2Touched,
      pin2Value,
      pin3,
      pin3Error,
      pin3Touched,
      pin3Value,
      pin4,
      pin4Error,
      pin4Touched,
      pin4Value,
    ],
  )

  const onNext = () => {
    generateVotingKeys(pin)
  }

  const handleOnPress = React.useCallback(
    (pinSelected: number) => {
      setCurrentActivePin(pinSelected)

      switch (pinSelected) {
        case 1:
          if (!pin1Touched) setPin1Touched(true)
          break
        case 2:
          if (!pin2Touched) setPin2Touched(true)
          break
        case 3:
          if (!pin3Touched) setPin3Touched(true)
          break
        case 4:
          if (!pin4Touched) setPin4Touched(true)
          break

        default:
          break
      }
    },
    [pin1Touched, pin2Touched, pin3Touched, pin4Touched],
  )

  return (
    <SafeAreaView
      edges={['left', 'right', 'bottom']}
      style={[a.flex_1, {backgroundColor: p.bg_color_max}, a.px_lg, a.pb_lg]}
    >
      <Padding style={a.px_lg}>
        <Stepper
          title={strings.registerCatalyst.step3Title}
          currentStep={3}
          totalSteps={3}
        />
      </Padding>

      <ScrollView bounces={false} contentContainerStyle={[]}>
        <Description>{strings.registerCatalyst.step3Description}</Description>

        <Space.Height.lg />

        <Row style={[{justifyContent: 'center'}]}>
          <PinBox
            onPress={() => handleOnPress(1)}
            done={done}
            error={pin1Error}
            selected={currentActivePin === 1}
          >
            {pin1Value}
          </PinBox>

          <Space.Width.lg />

          <PinBox
            onPress={() => handleOnPress(2)}
            done={done}
            error={pin2Error}
            selected={currentActivePin === 2}
          >
            {pin2Value}
          </PinBox>

          <Space.Width.md />

          <PinBox
            onPress={() => handleOnPress(3)}
            done={done}
            error={pin3Error}
            selected={currentActivePin === 3}
          >
            {pin3Value}
          </PinBox>

          <Space.Width.md />

          <PinBox
            onPress={() => handleOnPress(4)}
            done={done}
            error={pin4Error}
            selected={currentActivePin === 4}
          >
            {pin4Value}
          </PinBox>
        </Row>
      </ScrollView>

      <View style={[{flex: 1}]} />

      <Padding style={a.px_lg}>
        <Actions>
          <Button
            onPress={() => onNext()}
            title={strings.registerCatalyst.confirm}
            disabled={!done || isLoading}
          />
        </Actions>
      </Padding>

      <Space.Height.lg />

      <NumericKeyboard onKeyDown={onKeyDown} />

      {isLoading && (
        <View
          style={[
            {
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: p.bg_color_max,
            },
            a.align_center,
            a.justify_center,
          ]}
        >
          <ActivityIndicator size="large" color={isDark ? 'white' : 'black'} />
        </View>
      )}
    </SafeAreaView>
  )
}

type GenerateKeysInput = string

interface GenerateKeysOutput {
  catalystKeyHex: string
  votingKeyEncrypted: string
}

type GenerateKeysError = Error

const useGenerateVotingKeys = (
  options?: UseMutationOptions<
    GenerateKeysOutput,
    GenerateKeysError,
    GenerateKeysInput
  >,
) => {
  const mutation = useMutation(async (pin: string) => {
    const catalystKey = await generatePrivateKeyForCatalyst()
      .then((key) => key.toRawKey())
      .then((key) => key.asBytes())

    const catalystKeyHex = Buffer.from(catalystKey).toString('hex')

    const password = new Uint8Array(Buffer.from(pin.split('').map(Number)))
    const votingKeyEncrypted = await encryptWithPassword(password, catalystKey)

    return {
      catalystKeyHex,
      votingKeyEncrypted,
    }
  }, options)

  return {
    ...mutation,
    generateVotingKeys: mutation.mutate,
  }
}

// NOTE: keyboard horizontal padding is 0, yet bottom must respect safe-area-view
const Padding = ({style, ...props}: ViewProps) => {
  return <View {...props} style={style} />
}
