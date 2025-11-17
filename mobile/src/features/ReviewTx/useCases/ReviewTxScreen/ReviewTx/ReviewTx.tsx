import {atoms as a, useTheme} from '@yoroi/theme'

import {createMaterialTopTabNavigator} from '@react-navigation/material-top-tabs'
import * as React from 'react'
import {ScrollView as RNScrollView} from 'react-native'

import {useReviewTxMemo} from '~/features/ReviewTx/common/context/ReviewTxMemoContext'
import {FormattedMetadata, FormattedTx} from '~/features/ReviewTx/common/types'
import {memoMaxLenght} from '~/features/Send/common/constants'
import {ShowMemoErrorTooLong} from '~/features/Send/useCases/StartMultiTokenTx/InputMemo/ShowMemoErrorTooLong'
import {ShowMemoInstructions} from '~/features/Send/useCases/StartMultiTokenTx/InputMemo/ShowMemoInstructions'
import {useStrings} from '~/kernel/i18n/useStrings'
import {useWalletNavigation} from '~/kernel/navigation/hooks/useWalletNavigation'
import {Button} from '~/ui/Button/Button'
import {SafeArea} from '~/ui/SafeArea/SafeArea'
import {ScrollView} from '~/ui/ScrollView/ScrollView'
import {ScrollViewProvider} from '~/ui/ScrollView/context/ScrollViewContext'
import {Space} from '~/ui/Space/Space'
import {TextInput} from '~/ui/TextInput/TextInput'

import {MetadataTab} from '../ReviewTx/Metadata/MetadataTab'
import {OverviewTab, ReviewDetailsProps} from '../ReviewTx/Overview/OverviewTab'
import {UTxOsTab} from '../ReviewTx/UTxOs/UTxOsTab'
import {DatumTab} from './Datum/DatumTab'
import {GovernanceTab} from './Governance/GovernanceTab'
import {MintTab} from './Mint/MintTab'
import {ReferenceInputsTab} from './ReferenceInputs/ReferenceInputs'

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

const TabWrapper = ({
  children,
  onConfirm,
  readOnly,
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
}

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
  createdBy?: React.ReactNode
  validationResult?: {valid: boolean; errors: string[]; warnings: string[]}
  onConfirm?: () => void
  readOnly?: boolean
  isReviewFlow?: boolean
}) => {
  const strings = useStrings()
  const {atoms: ta, palette: p} = useTheme()

  // Show metadata tab if metadata exists, even without hash (for historical transactions)
  const showMetadataTab = formattedMetadata?.metadata != null
  const showMintTab = !!formattedTx.mint
  const showReferenceInoutsTab = formattedTx.referenceInputs.length > 0
  const showDatumTab = formattedTx.outputs.some(
    (output) => output.datum != null,
  )
  const showGovernanceTab = !!formattedTx.governance

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
        children={() => (
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
        )}
      />

      <MaterialTab.Screen
        name={strings.txReview.tabLabel.utxos}
        children={() => (
          <TabWrapper
            onConfirm={onConfirm}
            readOnly={readOnly}
            showGoToTransactionsButton={readOnly && isReviewFlow && !onConfirm}
          >
            <UTxOsTab tx={formattedTx} />
          </TabWrapper>
        )}
      />

      {showMetadataTab && (
        <MaterialTab.Screen
          name={strings.txReview.tabLabel.metadataTab}
          children={() => (
            <TabWrapper
              onConfirm={onConfirm}
              readOnly={readOnly}
              showGoToTransactionsButton={readOnly && isReviewFlow && !onConfirm}
            >
              <MetadataTab
                hash={formattedMetadata?.hash ?? null}
                metadata={formattedMetadata?.metadata ?? null}
              />
            </TabWrapper>
          )}
        />
      )}

      {showMintTab && (
        <MaterialTab.Screen
          name={strings.txReview.tabLabel.mint}
          children={() => (
            <TabWrapper
              onConfirm={onConfirm}
              readOnly={readOnly}
              showGoToTransactionsButton={readOnly && isReviewFlow && !onConfirm}
            >
              <MintTab mintData={formattedTx.mint} />
            </TabWrapper>
          )}
        />
      )}

      {showReferenceInoutsTab && (
        <MaterialTab.Screen
          name={strings.txReview.tabLabel.referenceInputs}
          children={() => (
            <TabWrapper
              onConfirm={onConfirm}
              readOnly={readOnly}
              showGoToTransactionsButton={readOnly && isReviewFlow && !onConfirm}
            >
              <ReferenceInputsTab
                referenceInputs={formattedTx.referenceInputs}
              />
            </TabWrapper>
          )}
        />
      )}

      {showDatumTab && (
        <MaterialTab.Screen
          name={strings.txReview.tabLabel.datum}
          children={() => (
            <TabWrapper
              onConfirm={onConfirm}
              readOnly={readOnly}
              showGoToTransactionsButton={readOnly && isReviewFlow && !onConfirm}
            >
              <DatumTab outputs={formattedTx.outputs} />
            </TabWrapper>
          )}
        />
      )}

      {showGovernanceTab && (
        <MaterialTab.Screen
          name={strings.txReview.tabLabel.governance}
          children={() => (
            <TabWrapper
              onConfirm={onConfirm}
              readOnly={readOnly}
              showGoToTransactionsButton={readOnly && isReviewFlow && !onConfirm}
            >
              <GovernanceTab tx={formattedTx} />
            </TabWrapper>
          )}
        />
      )}
    </MaterialTab.Navigator>
  )
}
