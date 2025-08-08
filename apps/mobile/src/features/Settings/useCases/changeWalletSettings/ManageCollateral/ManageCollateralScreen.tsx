import {useMutation} from '@tanstack/react-query'
import {atoms as a, useTheme} from '@yoroi/theme'
import {Portfolio} from '@yoroi/types'
import BigNumber from 'bignumber.js'
import * as React from 'react'
import {
  Alert,
  LayoutAnimation,
  ScrollView,
  TouchableOpacity,
  TouchableOpacityProps,
  useWindowDimensions,
  View,
  ViewProps,
} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'

import {SettingsStackRoutes} from '../../../../../kernel/navigation/types'
import {useUnsafeParams, useWalletNavigation} from '../../../../../kernel/navigation/hooks'
import {Button, ButtonType} from '../../../../../ui/Button/Button'
import {Copiable} from '../../../../../ui/Copiable/Copiable'
import {ErrorPanel} from '../../../../../ui/ErrorPanel/ErrorPanel'
import {Icon} from '../../../../../ui/Icon'
import {Info} from '../../../../../ui/Icon/Info'
import {useModal} from '../../../../../ui/Modal/ModalContext'
import {Space} from '../../../../../ui/Space/Space'
import {Text} from '../../../../../ui/Text/Text'
import {useSetCollateralId} from '../../../../../wallets/cardano/utxoManager/useSetCollateralId'
import {
  collateralConfig,
  utxosMaker,
} from '../../../../../wallets/cardano/utxoManager/utxos'
import {useBalances} from '../../../../../wallets/hooks'
import {RawUtxo} from '../../../../../wallets/types/other'
import {YoroiEntry, YoroiSignedTx} from '../../../../../wallets/types/yoroi'
import {
  Amounts,
  asQuantity,
  Quantities,
} from '../../../../../wallets/utils/utils'
import {useReviewTx} from '../../../../ReviewTx/common/ReviewTxProvider'
import {useWalletManager} from '../../../../WalletManager/context/WalletManagerProvider'
import {CollateralInfoModal} from './CollateralInfoModal'
import {createCollateralEntry} from './helpers'
import {InitialCollateralInfoModal} from './InitialCollateralInfoModal'
import {useStrings} from '~/kernel/i18n/useStrings'

export const ManageCollateralScreen = () => {
  const {atoms: ta} = useTheme()

  const {wallet, meta: addressMode} = useWalletManager().selected!
  const {amount, collateralId, utxo} = wallet.getCollateralInfo()
  const screenHeight = useWindowDimensions().height

  const hasCollateral = collateralId !== '' && utxo !== undefined
  const didSpend = collateralId !== '' && utxo === undefined
  const {openModal, closeModal} = useModal()
  const strings = useStrings()
  const balances = useBalances(wallet)
  const {navigateToTxReview, resetToTxHistory} = useWalletNavigation()
  const {unsignedTxChanged} = useReviewTx()
  const lockedAmount = asQuantity(
    wallet.primaryBreakdown.lockedAsStorageCost.toString(),
  )

  const params = useUnsafeParams<SettingsStackRoutes['manage-collateral']>()

  const {mutate: createUnsignedTx, isLoading: isLoadingTx} = useMutation({
    mutationFn: (entries: YoroiEntry[]) =>
      wallet.createUnsignedTx({entries, addressMode}),
    retry: false,
    useErrorBoundary: true,
  })

  const {isLoading: isLoadingCollateral, setCollateralId} =
    useSetCollateralId(wallet)
  const handleRemoveCollateral = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)
    setCollateralId('')
  }
  const handleSetCollateralId = (collateralId: RawUtxo['utxo_id']) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)
    setCollateralId(collateralId)
  }

  const handleOnSuccess = (signedTx?: YoroiSignedTx) => {
    if (signedTx?.signedTx?.id == null)
      throw new Error('ManageCollateralScreen:: invalid state')
    const collateralId = `${signedTx.signedTx.id}:0`
    setCollateralId(collateralId)
    resetToTxHistory()
  }

  const createCollateralTransaction = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)

    createUnsignedTx([createCollateralEntry(wallet)], {
      onSuccess: (yoroiUnsignedTx) => {
        unsignedTxChanged(yoroiUnsignedTx)
        navigateToTxReview({
          onSuccess: (args) => handleOnSuccess(args?.signedTx),
          operations: [<Operation key="0" />],
        })
      },
    })
  }

  const isLoading = isLoadingTx || isLoadingCollateral

  const handleGenerateCollateral = () => {
    closeModal()

    const utxos = utxosMaker(wallet.utxos)
    const possibleCollateralId = utxos.drawnCollateral()

    if (possibleCollateralId !== undefined) {
      handleSetCollateralId(possibleCollateralId)
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
        strings.notEnoughFundsAlertTitle,
        strings.notEnoughFundsAlertMessage,
        [{text: strings.notEnoughFundsAlertOK, onPress: () => true}],
        {cancelable: false},
      )
      return
    }

    createCollateralTransaction()
  }

  const handleCollateralInfoModal = () => {
    openModal({
      title: strings.initialCollateralInfoModalTitle,
      content: <InitialCollateralInfoModal />,
      footer: (
        <ModalsButtons
          onConfirm={handleGenerateCollateral}
          onCancel={closeModal}
        />
      ),
      height: Math.min(screenHeight * 0.9, 650),
    })
  }

  const shouldShowPrimaryButton = !hasCollateral || didSpend
  const shouldShowBackButton = !shouldShowPrimaryButton && !!params?.backButton

  return (
    <SafeAreaView
      edges={['top', 'left', 'right', 'bottom']}
      style={[ta.bg_color_max, a.flex_1, a.px_lg]}
    >
      <ScrollView>
        <Text
          style={[
            a.flex_1,
            a.self_center,
          ]}
        >
          {strings.lockedAsCollateral}
        </Text>

        <Space.Height.sm />

        <ActionableAmount
          amount={amount}
          onRemove={handleRemoveCollateral}
          collateralId={collateralId}
          disabled={isLoading}
        />

        <Space.Height.lg />

        {hasCollateral && (
          <>
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

            <Text>{strings.removeCollateral}</Text>
          </>
        )}

        {didSpend && (
          <ErrorPanel>
            <Text>{strings.collateralSpent}</Text>
          </ErrorPanel>
        )}
      </ScrollView>

      {shouldShowPrimaryButton && (
        <Button
          title={strings.generateCollateral}
          onPress={handleCollateralInfoModal}
          disabled={isLoading}
        />
      )}

      {shouldShowBackButton && params?.backButton && (
        <Button
          title={params.backButton.content}
          onPress={params.backButton.onPress}
        />
      )}

      <Space.Height.lg />
    </SafeAreaView>
  )
}

const ModalsButtons = ({
  onConfirm,
  onCancel,
}: {
  onConfirm: () => void
  onCancel: () => void
}) => {
  const strings = useStrings()

  return (
    <View>
      <Button
        type={ButtonType.SecondaryText}
        title={strings.cancel}
        onPress={onCancel}
      />

      <Button
        title={strings.initialCollateralInfoModalButton}
        onPress={onConfirm}
      />
    </View>
  )
}

type ActionableAmountProps = {
  collateralId: RawUtxo['utxo_id']
  amount: Portfolio.Token.Amount
  onRemove(): void
  disabled?: boolean
}
const ActionableAmount = ({
  amount,
  onRemove,
  collateralId,
  disabled,
}: ActionableAmountProps) => {
  const handleRemove = () => onRemove()

  return (
    <View
      style={[a.flex_row, a.justify_between, a.align_center]}
      testID="amountItem"
    >
      {/*<Left>*/}
      {/*  <TokenAmountItem amount={amount} />*/}
      {/*</Left>*/}

      {collateralId !== '' && (
        <Right>
          <RemoveAmountButton onPress={handleRemove} disabled={disabled} />
        </Right>
      )}
    </View>
  )
}

const Left = ({style, ...props}: ViewProps) => (
  <View style={[style, {flex: 1}]} {...props} />
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

const Operation = () => {
  const {atoms: ta, palette: p} = useTheme()
  const strings = useStrings()
  const {openModal} = useModal()

  const handleOnPressInfo = () => {
    openModal({
      title: strings.collateralInfoModalTitle,
      content: <CollateralInfoModal />,
      height: 500,
    })
  }

  return (
    <View style={[a.flex_row, a.align_center]}>
      <Text style={[a.body_2_md_regular, ta.text_gray_medium]}>
        {strings.collateralInfoModalLabel}
      </Text>

      <Space.Width.xs />

      <TouchableOpacity onPress={handleOnPressInfo}>
        <Info size={24} color={p.iconColor} />
      </TouchableOpacity>
    </View>
  )
}
