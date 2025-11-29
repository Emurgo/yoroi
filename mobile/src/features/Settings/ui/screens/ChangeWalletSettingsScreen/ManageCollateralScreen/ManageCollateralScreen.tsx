import {RawUtxo} from '@yoroi/api'
import {atoms as a, useTheme} from '@yoroi/theme'
import {TransactionOutput} from '@yoroi/tx'
import {Branded, Portfolio, UtxoId} from '@yoroi/types'

import * as CSL from '@emurgo/cross-csl-core'
import {useMutation} from '@tanstack/react-query'
import BigNumber from 'bignumber.js'
import * as React from 'react'
import {
  Alert,
  LayoutAnimation,
  ScrollView,
  TouchableOpacity,
  TouchableOpacityProps,
  View,
  ViewProps,
  useWindowDimensions,
} from 'react-native'

import {useBalances} from '~/features/Portfolio/common/hooks/useBalances'
import {getTxIdFromArgs} from '~/features/ReviewTx/common/utils/getTxId'
import {useSelectedWallet} from '~/features/WalletManager/hooks/useSelectedWallet'
import {useStrings} from '~/kernel/i18n/useStrings'
import {useUnsafeParams} from '~/kernel/navigation/hooks/useUnsafeParams'
import {useWalletNavigation} from '~/kernel/navigation/hooks/useWalletNavigation'
import {SettingsStackRoutes} from '~/kernel/navigation/types'
import {Button, ButtonType} from '~/ui/Button/Button'
import {Copiable} from '~/ui/Copiable/Copiable'
import {ErrorPanel} from '~/ui/ErrorPanel/ErrorPanel'
import {Icon} from '~/ui/Icon'
import {useModal} from '~/ui/Modal/context/ModalContext'
import {SafeArea} from '~/ui/SafeArea/SafeArea'
import {Space} from '~/ui/Space/Space'
import {Text} from '~/ui/Text/Text'
import {TokenAmountItem} from '~/ui/TokenAmountItem/TokenAmountItem'
import {createSendTxFromWallet} from '~/wallets/cardano/transaction-recipes'
import {useCollateralInfo} from '~/wallets/cardano/utxoManager/useCollateralInfo'
import {useSetCollateralId} from '~/wallets/cardano/utxoManager/useSetCollateralId'
import {collateralConfig, utxosMaker} from '~/wallets/cardano/utxoManager/utxos'
import {Amounts, Quantities, asQuantity} from '~/wallets/utils/utils'

import {CollateralInfoModal} from './CollateralInfoModal'
import {
  InitialCollateralInfoModal,
  InitialCollateralInfoModalFooter,
} from './InitialCollateralInfoModal'
import {createCollateralEntry} from './helpers'

export const ManageCollateralScreen = () => {
  const {atoms: ta} = useTheme()
  const {wallet, meta} = useSelectedWallet()
  const {amount, collateralId, utxo} = useCollateralInfo(wallet)
  const screenHeight = useWindowDimensions().height
  const didSpend = collateralId !== '' && utxo === undefined
  const {openModal, closeModal} = useModal()
  const strings = useStrings()
  const balances = useBalances(wallet)
  const {navigateToTxReview, resetToTxHistory} = useWalletNavigation()

  const lockedAmount = asQuantity(
    wallet.primaryBreakdown().lockedAsStorageCost.toString(),
  )
  const hasCollateral = collateralId !== '' && utxo !== undefined
  const params = useUnsafeParams<SettingsStackRoutes['manage-collateral']>()

  const {mutate: createUnsignedTx, isPending: isLoadingTx} = useMutation({
    mutationFn: (entries: TransactionOutput[]) =>
      createSendTxFromWallet(wallet, {entries, addressMode: meta.addressMode}),
    retry: false,
  })

  const {isPending: isLoadingCollateral, setCollateralId} =
    useSetCollateralId(wallet)
  const handleRemoveCollateral = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)
    setCollateralId('' as UtxoId)
  }
  const handleSetCollateralId = (collateralId: RawUtxo['utxo_id']) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)
    setCollateralId(collateralId)
  }

  const handleOnSuccess = async (args?: {
    signedTx?: CSL.Transaction | ((csl: CSL.WasmModuleProxy) => CSL.Transaction)
    txId?: string
  }) => {
    // Use utility function to safely extract txId
    // The CBOR was already passed to navigateToTxReview, so we can't access it here
    // But args?.txId should be available from useOnConfirm
    const txId = await getTxIdFromArgs(args)

    if (!txId) {
      throw new Error('ManageCollateralScreen:: no txId available')
    }

    const collateralId = Branded.asUtxoId(`${txId}:0`)
    setCollateralId(collateralId)
    resetToTxHistory()
  }

  const createCollateralTransaction = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)

    createUnsignedTx([createCollateralEntry(wallet)], {
      onSuccess: async (result) => {
        // Set collateral ID immediately after transaction creation (even if not yet onchain)
        // This prevents the UTXO from being used in other transactions
        // The collateral UTXO will be at index 0 (first output of the transaction)
        try {
          const txId = await getTxIdFromArgs(undefined, result.cbor)
          if (txId) {
            const collateralId = Branded.asUtxoId(`${txId}:0`)
            setCollateralId(collateralId)
          }
        } catch (error) {
          // Don't block the flow if setting collateral ID fails
        }

        navigateToTxReview({
          cbor: result.cbor,
          onSuccessWithoutFeedback: (args) => handleOnSuccess(args),
          details: {
            title: strings.manageCollateral.collateralInfoModalLabel,
            component: <CollateralInfoModal />,
          },
          context: 'send',
        })
      },
    })
  }

  const isLoading = isLoadingTx || isLoadingCollateral

  const handleGenerateCollateral = () => {
    const utxos = utxosMaker(wallet.utxos())
    const possibleCollateralId = utxos.drawnCollateral()

    if (possibleCollateralId !== undefined) {
      handleSetCollateralId(possibleCollateralId)
      closeModal()
      return
    }

    const primaryTokenBalance = new BigNumber(
      Amounts.getAmount(balances, wallet.portfolioPrimaryTokenInfo.id).quantity,
    )
    const lockedBalance = Quantities.isZero(lockedAmount)
      ? new BigNumber(0)
      : new BigNumber(lockedAmount)

    if (
      primaryTokenBalance
        .minus(lockedBalance)
        .isLessThan(collateralConfig.minLovelace)
    ) {
      Alert.alert(
        strings.manageCollateral.notEnoughFundsAlertTitle,
        strings.manageCollateral.notEnoughFundsAlertMessage,
        [
          {
            text: strings.manageCollateral.notEnoughFundsAlertOK,
            onPress: () => true,
          },
        ],
        {cancelable: false},
      )
      return
    }

    closeModal()
    createCollateralTransaction()
  }

  const handleInitialCollateralInfoModal = () => {
    openModal({
      title: strings.manageCollateral.initialCollateralInfoModalTitle,
      content: <InitialCollateralInfoModal />,
      footer: (
        <InitialCollateralInfoModalFooter
          onConfirm={handleGenerateCollateral}
          onCancel={closeModal}
        />
      ),
      height: Math.min(screenHeight * 0.7, 650),
    })
  }

  const shouldShowPrimaryButton = !hasCollateral || didSpend
  const shouldShowBackButton = !shouldShowPrimaryButton && !!params?.backButton

  return (
    <SafeArea>
      <ScrollView style={[ta.bg_color_max, a.flex_1, a.p_lg]} bounces={false}>
        <Text style={[a.self_center, ta.text_gray_max]}>
          {strings.manageCollateral.lockedAsCollateral}
        </Text>
        <Space.Height.sm />
        <ActionableAmount
          amount={amount}
          onRemove={handleRemoveCollateral}
          collateralId={collateralId}
          disabled={isLoading}
        />
        {hasCollateral && (
          <>
            <Space.Height.lg />

            <Row>
              <Copiable text={collateralId}>
                <Text
                  ellipsizeMode="middle"
                  numberOfLines={1}
                  monospace
                  small
                  style={{flex: 1}}
                  secondary
                >
                  {collateralId}
                </Text>
              </Copiable>
            </Row>

            <Space.Height.lg />

            <Text>{strings.manageCollateral.removeCollateral}</Text>
          </>
        )}
        <Space.Height.lg fill />
        {didSpend && (
          <>
            <ErrorPanel>
              <Text>{strings.manageCollateral.collateralSpent}</Text>
            </ErrorPanel>
            <Space.Height.lg />
          </>
        )}
      </ScrollView>
      <SafeArea.Footer>
        {shouldShowPrimaryButton && (
          <Button
            title={strings.manageCollateral.generateCollateral}
            onPress={handleInitialCollateralInfoModal}
            disabled={isLoading}
          />
        )}

        {shouldShowBackButton && params?.backButton && (
          <Button
            title={params.backButton.content}
            onPress={params.backButton.onPress}
            type={ButtonType.Secondary}
          />
        )}
      </SafeArea.Footer>
    </SafeArea>
  )
}

type ActionableAmountProps = {
  collateralId: RawUtxo['utxo_id']
  amount: Portfolio.Token.Amount
  onRemove(): void
  disabled?: boolean
}
const ActionableAmount = ({
  onRemove,
  collateralId,
  amount,
  disabled,
}: ActionableAmountProps) => {
  const handleRemove = () => onRemove()

  return (
    <View
      style={[a.flex_row, a.justify_between, a.align_center]}
      testID="amountItem"
    >
      <Left>
        <TokenAmountItem amount={amount} />
      </Left>

      {collateralId !== '' && (
        <Right>
          <RemoveAmountButton onPress={handleRemove} disabled={disabled} />
        </Right>
      )}
    </View>
  )
}

const Left = ({style, ...props}: ViewProps) => (
  <View style={[style, a.flex_1]} {...props} />
)
const Right = ({style, ...props}: ViewProps) => (
  <View style={[style, a.pl_lg]} {...props} />
)
const Row = ({style, ...props}: ViewProps) => (
  <View style={[style, a.flex_row, a.align_center]} {...props} />
)

const RemoveAmountButton = ({disabled, ...props}: TouchableOpacityProps) => {
  const {palette: p} = useTheme()

  return (
    <TouchableOpacity
      testID="removeAmountButton"
      {...props}
      disabled={disabled}
      style={{opacity: disabled ? 0.5 : 1}}
    >
      <Icon.CrossCircle size={26} color={p.gray_900} />
    </TouchableOpacity>
  )
}
