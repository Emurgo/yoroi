import {atoms as a, useTheme} from '@yoroi/theme'

import {createMaterialTopTabNavigator} from '@react-navigation/material-top-tabs'
import * as React from 'react'
import {ScrollView as RNScrollView} from 'react-native'

import {FormattedMetadata, FormattedTx} from '~/features/ReviewTx/common/types'
import {useStrings} from '~/kernel/i18n/useStrings'
import {Button} from '~/ui/Button/Button'
import {SafeArea} from '~/ui/SafeArea/SafeArea'
import {ScrollView} from '~/ui/ScrollView/ScrollView'
import {ScrollViewProvider} from '~/ui/ScrollView/context/ScrollViewContext'
import {isEmptyString} from '~/wallets/utils/string'

import {MetadataTab} from '../ReviewTx/Metadata/MetadataTab'
import {OverviewTab, ReviewDetailsProps} from '../ReviewTx/Overview/OverviewTab'
import {UTxOsTab} from '../ReviewTx/UTxOs/UTxOsTab'
import {MintTab} from './Mint/MintTab'
import {ReferenceInputsTab} from './ReferenceInputs/ReferenceInputs'

const MaterialTab = createMaterialTopTabNavigator()

const TabWrapper = ({
  children,
  onConfirm,
}: {
  children: React.ReactNode
  onConfirm: () => void
}) => {
  const {atoms: ta} = useTheme()
  const strings = useStrings()
  const scrollViewRef = React.useRef<RNScrollView | null>(null)

  return (
    <ScrollViewProvider>
      <SafeArea>
        <ScrollView ref={scrollViewRef} style={[a.flex_1, ta.bg_color_max]}>
          {children}
        </ScrollView>
        <SafeArea.Footer>
          <Button title={strings.txReview.confirm} onPress={onConfirm} />
        </SafeArea.Footer>
      </SafeArea>
    </ScrollViewProvider>
  )
}

export const ReviewTx = ({
  formattedTx,
  formattedMetadata,
  operations,
  operationsNotice,
  details,
  receiverCustomTitle,
  createdBy,
  onConfirm,
}: {
  formattedTx: FormattedTx
  formattedMetadata?: FormattedMetadata
  operations?: Array<React.ReactNode>
  operationsNotice?: React.ReactNode
  details?: ReviewDetailsProps
  receiverCustomTitle?: React.ReactNode
  createdBy?: React.ReactNode
  onConfirm: () => void
}) => {
  const strings = useStrings()
  const {atoms: ta, palette: p} = useTheme()

  const showMetadataTab =
    !isEmptyString(formattedMetadata?.hash) &&
    formattedMetadata?.metadata != null
  const showMintTab = !!formattedTx.mint
  const showReferenceInoutsTab = formattedTx.referenceInputs.length > 0

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
        tabBarStyle: {backgroundColor: p.bg_color_max},
      }}
    >
      <MaterialTab.Screen
        name={strings.txReview.tabLabel.overview}
        component={() => (
          <TabWrapper onConfirm={onConfirm}>
            <OverviewTab
              tx={formattedTx}
              extraOperations={operations}
              operationsNotice={operationsNotice}
              details={details}
              createdBy={createdBy}
              receiverCustomTitle={receiverCustomTitle}
            />
          </TabWrapper>
        )}
      />

      <MaterialTab.Screen
        name={strings.txReview.tabLabel.utxos}
        component={() => (
          <TabWrapper onConfirm={onConfirm}>
            <UTxOsTab tx={formattedTx} />
          </TabWrapper>
        )}
      />

      {showMetadataTab && (
        <MaterialTab.Screen
          name={strings.txReview.tabLabel.metadataTab}
          component={() => (
            <TabWrapper onConfirm={onConfirm}>
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
          component={() => (
            <TabWrapper onConfirm={onConfirm}>
              <MintTab mintData={formattedTx.mint} />
            </TabWrapper>
          )}
        />
      )}

      {showReferenceInoutsTab && (
        <MaterialTab.Screen
          name={strings.txReview.tabLabel.referenceInputs}
          component={() => (
            <TabWrapper onConfirm={onConfirm}>
              <ReferenceInputsTab
                referenceInputs={formattedTx.referenceInputs}
              />
            </TabWrapper>
          )}
        />
      )}
    </MaterialTab.Navigator>
  )
}
