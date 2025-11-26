import {atoms as a, useTheme} from '@yoroi/theme'

import {createMaterialTopTabNavigator} from '@react-navigation/material-top-tabs'
import * as React from 'react'
import {ScrollView as RNScrollView} from 'react-native'

import {useReviewTxMemo} from '~/features/ReviewTx/common/context/ReviewTxMemoContext'
import {FormattedMetadata, FormattedTx} from '~/features/ReviewTx/common/types'
import {memoMaxLenght} from '~/features/Send/common/constants'
import {useStrings} from '~/kernel/i18n/useStrings'
import {useWalletNavigation} from '~/kernel/navigation/hooks/useWalletNavigation'
import {Button} from '~/ui/Button/Button'
import {SafeArea} from '~/ui/SafeArea/SafeArea'
import {ScrollView} from '~/ui/ScrollView/ScrollView'
import {ScrollViewProvider} from '~/ui/ScrollView/context/ScrollViewContext'
import {Space} from '~/ui/Space/Space'
import {TextInput} from '~/ui/TextInput/TextInput'

import {OverviewTab, ReviewDetailsProps} from '../ReviewTx/Overview/OverviewTab'
import {UTxOsTab} from '../ReviewTx/UTxOs/UTxOsTab'
import {DetailsTab} from './Details/DetailsTab'
import {OperationsTab} from './Operations/OperationsTab'
import {ShowMemoErrorTooLong} from './ShowMemoErrorTooLong'
import {ShowMemoInstructions} from './ShowMemoInstructions'
import {SignaturesTab} from './Signatures/SignaturesTab'
import {SmartContractsTab} from './SmartContracts/SmartContractsTab'

const MaterialTab = createMaterialTopTabNavigator()

const MemoInput = () => {
  const {memo, setMemo} = useReviewTxMemo()
  const strings = useStrings()
  const hasMemoError = memo.length > memoMaxLenght

  return (
    <TextInput
      value={memo}
      onChangeText={setMemo}
      label={strings.send.memoLabel}
      autoComplete="off"
      testID="memoFieldInput"
      error={hasMemoError ? true : undefined}
      renderComponentStyle={{maxHeight: 80}}
      multiline
      focusable
      helper={
        hasMemoError ? (
          <ShowMemoErrorTooLong memo={memo} />
        ) : (
          <ShowMemoInstructions memo={memo} />
        )
      }
    />
  )
}

const TabWrapper = React.memo(
  ({
    children,
    onConfirm,
    readOnly: _readOnly,
    showMemo = false,
    showGoToTransactionsButton = false,
  }: {
    children: React.ReactNode
    onConfirm?: () => void
    readOnly?: boolean
    showMemo?: boolean
    showGoToTransactionsButton?: boolean
  }) => {
    const {atoms: ta} = useTheme()
    const strings = useStrings()
    const scrollViewRef = React.useRef<RNScrollView | null>(null)
    const {resetToTxHistory} = useWalletNavigation()

    return (
      <ScrollViewProvider>
        <SafeArea>
          <ScrollView ref={scrollViewRef} style={[a.flex_1, ta.bg_color_max]}>
            {children}
          </ScrollView>
          {showGoToTransactionsButton ? (
            <SafeArea.Footer>
              <Button
                title={strings.txReview.submittedTxButton}
                onPress={resetToTxHistory}
              />
            </SafeArea.Footer>
          ) : (
            onConfirm && (
              <SafeArea.Footer>
                {showMemo && (
                  <>
                    <Space.Height.lg />
                    <MemoInput />
                    <Space.Height.lg />
                  </>
                )}
                <Button title={strings.txReview.confirm} onPress={onConfirm} />
              </SafeArea.Footer>
            )
          )}
        </SafeArea>
      </ScrollViewProvider>
    )
  },
)

export const ReviewTx = ({
  formattedTx,
  formattedMetadata,
  operations,
  operationsNotice,
  generalNotice,
  details,
  receiverCustomTitle,
  createdBy,
  validationResult,
  cbor,
  onConfirm,
  readOnly = false,
  isReviewFlow = false,
}: {
  formattedTx: FormattedTx
  formattedMetadata?: FormattedMetadata
  operations?: Array<React.ReactNode>
  operationsNotice?: React.ReactNode
  generalNotice?: React.ReactNode
  details?: ReviewDetailsProps
  receiverCustomTitle?: React.ReactNode
  createdBy?: {logo?: string; url: string; name?: string}
  validationResult?: {valid: boolean; errors: string[]; warnings: string[]}
  cbor?: string | null
  onConfirm?: () => void
  readOnly?: boolean
  isReviewFlow?: boolean
}) => {
  const strings = useStrings()
  const {atoms: ta, palette: p} = useTheme()

  // Tab visibility logic according to proposal
  const showOperationsTab =
    (formattedTx.certificates != null && formattedTx.certificates.length > 0) ||
    (formattedTx.withdrawals != null && formattedTx.withdrawals.length > 0) ||
    formattedTx.governance != null

  const showSmartContractsTab =
    formattedTx.collateral != null ||
    formattedTx.collateralReturn != null ||
    formattedTx.totalCollateral != null ||
    formattedTx.scriptDataHash != null ||
    formattedTx.outputs.some((output) => output.datum != null) ||
    (formattedTx.witnessSet?.plutusScripts.length ?? 0) > 0 ||
    (formattedTx.witnessSet?.plutusData.length ?? 0) > 0

  const showSignaturesTab =
    (formattedTx.requiredSigners != null &&
      formattedTx.requiredSigners.length > 0) ||
    (formattedTx.witnessSet?.vkeys.length ?? 0) > 0 ||
    (formattedTx.witnessSet?.bootstraps.length ?? 0) > 0 ||
    (formattedTx.witnessSet?.nativeScripts.length ?? 0) > 0

  const showDetailsTab =
    formattedTx.ttl != null ||
    formattedTx.validityIntervalStart != null ||
    formattedTx.networkId != null ||
    formattedMetadata != null ||
    cbor != null

  // Memoize tab children to prevent recreation on every render
  const overviewTabChildren = React.useMemo(
    () => (
      <TabWrapper
        onConfirm={onConfirm}
        readOnly={readOnly}
        showMemo={!readOnly}
        showGoToTransactionsButton={readOnly && isReviewFlow && !onConfirm}
      >
        <OverviewTab
          tx={formattedTx}
          extraOperations={operations}
          operationsNotice={operationsNotice}
          generalNotice={generalNotice}
          details={details}
          createdBy={createdBy}
          receiverCustomTitle={receiverCustomTitle}
          validationResult={validationResult}
          readOnly={readOnly}
        />
      </TabWrapper>
    ),
    [
      onConfirm,
      readOnly,
      isReviewFlow,
      formattedTx,
      operations,
      operationsNotice,
      generalNotice,
      details,
      createdBy,
      receiverCustomTitle,
      validationResult,
    ],
  )

  const utxosTabChildren = React.useMemo(
    () => (
      <TabWrapper
        onConfirm={onConfirm}
        readOnly={readOnly}
        showGoToTransactionsButton={readOnly && isReviewFlow && !onConfirm}
      >
        <UTxOsTab tx={formattedTx} />
      </TabWrapper>
    ),
    [onConfirm, readOnly, isReviewFlow, formattedTx],
  )

  const operationsTabChildren = React.useMemo(
    () => (
      <TabWrapper
        onConfirm={onConfirm}
        readOnly={readOnly}
        showGoToTransactionsButton={readOnly && isReviewFlow && !onConfirm}
      >
        <OperationsTab
          tx={formattedTx}
          operations={undefined}
          operationsNotice={operationsNotice}
        />
      </TabWrapper>
    ),
    [onConfirm, readOnly, isReviewFlow, formattedTx, operationsNotice],
  )

  const smartContractsTabChildren = React.useMemo(
    () => (
      <TabWrapper
        onConfirm={onConfirm}
        readOnly={readOnly}
        showGoToTransactionsButton={readOnly && isReviewFlow && !onConfirm}
      >
        <SmartContractsTab tx={formattedTx} />
      </TabWrapper>
    ),
    [onConfirm, readOnly, isReviewFlow, formattedTx],
  )

  const signaturesTabChildren = React.useMemo(
    () => (
      <TabWrapper
        onConfirm={onConfirm}
        readOnly={readOnly}
        showGoToTransactionsButton={readOnly && isReviewFlow && !onConfirm}
      >
        <SignaturesTab tx={formattedTx} />
      </TabWrapper>
    ),
    [onConfirm, readOnly, isReviewFlow, formattedTx],
  )

  const detailsTabChildren = React.useMemo(
    () => (
      <TabWrapper
        onConfirm={onConfirm}
        readOnly={readOnly}
        showGoToTransactionsButton={readOnly && isReviewFlow && !onConfirm}
      >
        <DetailsTab
          tx={formattedTx}
          formattedMetadata={formattedMetadata}
          cbor={cbor}
        />
      </TabWrapper>
    ),
    [onConfirm, readOnly, isReviewFlow, formattedTx, formattedMetadata, cbor],
  )

  return (
    <MaterialTab.Navigator
      screenOptions={{
        swipeEnabled: false,
        tabBarShowLabel: true,
        tabBarGap: a.gap_sm.gap,
        tabBarLabelStyle: {
          ...a.body_1_lg_medium,
        },
        tabBarActiveTintColor: ta.text_primary_medium.color,
        tabBarInactiveTintColor: ta.text_gray_medium.color,
        tabBarBounces: true,
        tabBarScrollEnabled: true,
        tabBarStyle: {backgroundColor: p.bg_color_max},
      }}
    >
      <MaterialTab.Screen
        name={strings.txReview.tabLabel.overview}
        children={() => overviewTabChildren}
      />

      <MaterialTab.Screen
        name={strings.txReview.tabLabel.utxos}
        children={() => utxosTabChildren}
      />

      {showOperationsTab && (
        <MaterialTab.Screen
          name={strings.txReview.tabLabel.operations}
          children={() => operationsTabChildren}
        />
      )}

      {showSmartContractsTab && (
        <MaterialTab.Screen
          name={strings.txReview.tabLabel.smartContracts}
          children={() => smartContractsTabChildren}
        />
      )}

      {showSignaturesTab && (
        <MaterialTab.Screen
          name={strings.txReview.tabLabel.signatures}
          children={() => signaturesTabChildren}
        />
      )}

      {showDetailsTab && (
        <MaterialTab.Screen
          name={strings.txReview.tabLabel.details}
          children={() => detailsTabChildren}
        />
      )}
    </MaterialTab.Navigator>
  )
}
