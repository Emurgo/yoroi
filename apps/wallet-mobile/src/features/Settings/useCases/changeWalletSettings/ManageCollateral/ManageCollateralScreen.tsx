import {useTheme} from '@yoroi/theme'
import {Portfolio} from '@yoroi/types'
import BigNumber from 'bignumber.js'
import * as React from 'react'
import {
  Alert,
  LayoutAnimation,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TouchableOpacityProps,
  useWindowDimensions,
  View,
  ViewProps,
} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'
import {useMutation} from 'react-query'

import {Button} from '../../../../../components/Button/Button'
import {CopyButton} from '../../../../../components/CopyButton'
import {ErrorPanel} from '../../../../../components/ErrorPanel/ErrorPanel'
import {Icon} from '../../../../../components/Icon'
import {Info} from '../../../../../components/Icon/Info'
import {useModal} from '../../../../../components/Modal/ModalContext'
import {Space} from '../../../../../components/Space/Space'
import {Spacer} from '../../../../../components/Spacer/Spacer'
import {Text} from '../../../../../components/Text'
import {SettingsStackRoutes, useUnsafeParams, useWalletNavigation} from '../../../../../kernel/navigation'
import {useCollateralInfo} from '../../../../../yoroi-wallets/cardano/utxoManager/useCollateralInfo'
import {useSetCollateralId} from '../../../../../yoroi-wallets/cardano/utxoManager/useSetCollateralId'
import {collateralConfig, utxosMaker} from '../../../../../yoroi-wallets/cardano/utxoManager/utxos'
import {useBalances} from '../../../../../yoroi-wallets/hooks'
import {RawUtxo} from '../../../../../yoroi-wallets/types/other'
import {YoroiEntry, YoroiSignedTx} from '../../../../../yoroi-wallets/types/yoroi'
import {Amounts, asQuantity, Quantities} from '../../../../../yoroi-wallets/utils/utils'
import {TokenAmountItem} from '../../../../Portfolio/common/TokenAmountItem/TokenAmountItem'
import {useReviewTx} from '../../../../ReviewTx/common/ReviewTxProvider'
import {useSelectedWallet} from '../../../../WalletManager/common/hooks/useSelectedWallet'
import {CollateralInfoModal} from './CollateralInfoModal'
import {createCollateralEntry} from './helpers'
import {InitialCollateralInfoModal} from './InitialCollateralInfoModal'
import {useNavigateTo} from './navigation'
import {useStrings} from './strings'

export const ManageCollateralScreen = () => {
  const {styles} = useStyles()
  const {
    wallet,
    meta: {addressMode},
  } = useSelectedWallet()
  const screenHeight = useWindowDimensions().height
  const {amount, collateralId, utxo} = useCollateralInfo(wallet)
  const hasCollateral = collateralId !== '' && utxo !== undefined
  const didSpend = collateralId !== '' && utxo === undefined
  const navigateTo = useNavigateTo()
  const {openModal} = useModal()
  const strings = useStrings()
  const balances = useBalances(wallet)
  const {navigateToTxReview} = useWalletNavigation()
  const {unsignedTxChanged, onSuccessChanged, onErrorChanged, operationsChanged} = useReviewTx()
  const lockedAmount = asQuantity(wallet.primaryBreakdown.lockedAsStorageCost.toString())

  const params = useUnsafeParams<SettingsStackRoutes['manage-collateral']>()

  const {mutate: createUnsignedTx, isLoading: isLoadingTx} = useMutation({
    mutationFn: (entries: YoroiEntry[]) => wallet.createUnsignedTx({entries, addressMode}),
    retry: false,
    useErrorBoundary: true,
  })

  const {isLoading: isLoadingCollateral, setCollateralId} = useSetCollateralId(wallet)
  const handleRemoveCollateral = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)
    setCollateralId('')
  }
  const handleSetCollateralId = (collateralId: RawUtxo['utxo_id']) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)
    setCollateralId(collateralId)
  }

  const onSuccess = (signedTx: YoroiSignedTx) => {
    navigateTo.submittedTx()
    const collateralId = `${signedTx.signedTx.id}:0`
    setCollateralId(collateralId)
  }

  const onError = () => {
    navigateTo.failedTx()
  }

  const createCollateralTransaction = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)

    createUnsignedTx([createCollateralEntry(wallet)], {
      onSuccess: (yoroiUnsignedTx) => {
        unsignedTxChanged(yoroiUnsignedTx)
        operationsChanged([<Operation key="0" />])
        onSuccessChanged(onSuccess)
        onErrorChanged(onError)
        navigateToTxReview()
      },
    })
  }

  const isLoading = isLoadingTx || isLoadingCollateral

  const handleGenerateCollateral = () => {
    const utxos = utxosMaker(wallet.utxos)
    const possibleCollateralId = utxos.drawnCollateral()

    if (possibleCollateralId !== undefined) {
      handleSetCollateralId(possibleCollateralId)
      return
    }

    const primaryTokenBalance = new BigNumber(Amounts.getAmount(balances, wallet.portfolioPrimaryTokenInfo.id).quantity)
    const lockedBalance = Quantities.isZero(lockedAmount) ? new BigNumber(0) : new BigNumber(lockedAmount)

    if (primaryTokenBalance.minus(lockedBalance).isLessThan(collateralConfig.minLovelace)) {
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
    openModal(
      strings.initialCollateralInfoModalTitle,
      <InitialCollateralInfoModal onConfirm={handleGenerateCollateral} />,
      Math.min(screenHeight * 0.9, 650),
    )
  }

  const shouldShowPrimaryButton = !hasCollateral || didSpend
  const shouldShowBackButton = !shouldShowPrimaryButton && !!params?.backButton

  return (
    <SafeAreaView edges={['top', 'left', 'right', 'bottom']} style={styles.safeAreaView}>
      <ScrollView>
        <Text style={styles.heading}>{strings.lockedAsCollateral}</Text>

        <Spacer height={8} />

        <ActionableAmount
          amount={amount}
          onRemove={handleRemoveCollateral}
          collateralId={collateralId}
          disabled={isLoading}
        />

        <Spacer height={16} />

        {hasCollateral && (
          <>
            <Row>
              <Text ellipsizeMode="middle" numberOfLines={1} monospace small style={{flex: 1}} secondary>
                {collateralId}
              </Text>

              <CopyButton value={collateralId} />
            </Row>

            <Spacer height={16} />

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
        <Button title={strings.generateCollateral} onPress={handleCollateralInfoModal} disabled={isLoading} />
      )}

      {shouldShowBackButton && params?.backButton && (
        <Button title={params.backButton.content} onPress={params.backButton.onPress} />
      )}

      <Space height="lg" />
    </SafeAreaView>
  )
}

type ActionableAmountProps = {
  collateralId: RawUtxo['utxo_id']
  amount: Portfolio.Token.Amount
  onRemove(): void
  disabled?: boolean
}
const ActionableAmount = ({amount, onRemove, collateralId, disabled}: ActionableAmountProps) => {
  const {styles} = useStyles()

  const handleRemove = () => onRemove()

  return (
    <View style={styles.amountItem} testID="amountItem">
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

const Left = ({style, ...props}: ViewProps) => <View style={[style, {flex: 1}]} {...props} />
const Right = ({style, ...props}: ViewProps) => <View style={[style, {paddingLeft: 16}]} {...props} />
const Row = ({style, ...props}: ViewProps) => (
  <View style={[style, {flexDirection: 'row', alignItems: 'center'}]} {...props} />
)

const RemoveAmountButton = ({disabled, ...props}: TouchableOpacityProps) => {
  const {colors} = useStyles()

  return (
    <TouchableOpacity testID="removeAmountButton" {...props} disabled={disabled} style={{opacity: disabled ? 0.5 : 1}}>
      <Icon.CrossCircle size={26} color={colors.iconColor} />
    </TouchableOpacity>
  )
}

const Operation = () => {
  const {styles, colors} = useStyles()
  const strings = useStrings()
  const {openModal} = useModal()

  const handleOnPressInfo = () => {
    openModal(strings.collateralInfoModalTitle, <CollateralInfoModal />, 500)
  }

  return (
    <View style={styles.operation}>
      <Text style={styles.operationText}>{strings.collateralInfoModalLabel}</Text>

      <Space width="xs" />

      <TouchableOpacity onPress={handleOnPressInfo}>
        <Info size={24} color={colors.iconColor} />
      </TouchableOpacity>
    </View>
  )
}

const useStyles = () => {
  const {color, atoms} = useTheme()
  const styles = StyleSheet.create({
    safeAreaView: {
      backgroundColor: color.bg_color_max,
      ...atoms.flex_1,
      ...atoms.px_lg,
      ...atoms.flex_1,
      ...atoms.px_lg,
    },
    amountItem: {
      ...atoms.flex_row,
      ...atoms.justify_between,
      ...atoms.align_center,
      ...atoms.flex_row,
      ...atoms.justify_between,
      ...atoms.align_center,
    },
    heading: {
      ...atoms.flex_1,
      ...atoms.flex_1,
      alignSelf: 'center',
    },
    operation: {
      ...atoms.flex_row,
      ...atoms.align_center,
    },
    operationText: {
      ...atoms.body_2_md_regular,
      color: color.text_gray_medium,
    },
  })

  const colors = {
    iconColor: color.gray_900,
  }

  return {styles, colors} as const
  return {styles, colors} as const
}
