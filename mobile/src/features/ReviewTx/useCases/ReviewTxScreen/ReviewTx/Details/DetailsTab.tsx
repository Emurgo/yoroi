import {atoms as a, useTheme} from '@yoroi/theme'
import {Network} from '@yoroi/types'

import * as React from 'react'
import {useIntl} from 'react-intl'
import {Text, View} from 'react-native'

import {FormattedMetadata, FormattedTx} from '~/features/ReviewTx/common/types'
import {useSelectedWallet} from '~/features/WalletManager/hooks/useSelectedWallet'
import {useStrings} from '~/kernel/i18n/useStrings'
import {Copiable} from '~/ui/Copiable/Copiable'
import {Divider} from '~/ui/Divider/Divider'
import {Space} from '~/ui/Space/Space'
import {formatDateAndTime} from '~/wallets/utils/format'

export const DetailsTab = ({
  tx,
  formattedMetadata,
  cbor,
}: {
  tx: FormattedTx
  formattedMetadata?: FormattedMetadata
  cbor?: string | null
}) => {
  const {palette: p} = useTheme()
  const strings = useStrings()

  const hasTiming = tx.ttl != null || tx.validityIntervalStart != null
  const hasNetwork = tx.networkId != null
  const hasMetadata =
    formattedMetadata != null &&
    (formattedMetadata.hash != null ||
      formattedMetadata.metadata != null ||
      formattedMetadata.allLabels != null ||
      (formattedMetadata.scripts != null &&
        formattedMetadata.scripts.length > 0))
  const hasCbor = cbor != null

  if (!hasTiming && !hasNetwork && !hasMetadata && !hasCbor) {
    return (
      <View style={[a.flex_1, a.px_lg, {backgroundColor: p.bg_color_max}]}>
        <Space.Height.lg />
        <Text style={[a.body_1_lg_medium, {color: p.text_gray_medium}]}>
          {strings.txReview.details.noDetailsAvailable}
        </Text>
      </View>
    )
  }

  return (
    <View style={[a.flex_1, a.px_lg, {backgroundColor: p.bg_color_max}]}>
      <Space.Height.lg />

      {hasTiming && (
        <>
          <TimingSection tx={tx} />
          {(hasNetwork || hasMetadata || hasCbor) && (
            <>
              <Space.Height.lg />
              <Divider verticalSpace="md" />
            </>
          )}
        </>
      )}

      {hasNetwork && (
        <>
          <NetworkSection tx={tx} />
          {(hasMetadata || hasCbor) && (
            <>
              <Space.Height.lg />
              <Divider verticalSpace="md" />
            </>
          )}
        </>
      )}

      {hasMetadata && (
        <>
          <MetadataContent
            hash={formattedMetadata!.hash ?? null}
            metadata={formattedMetadata!.metadata ?? null}
            allLabels={formattedMetadata!.allLabels ?? null}
            scripts={formattedMetadata!.scripts ?? null}
          />
          {hasCbor && (
            <>
              <Space.Height.lg />
              <Divider verticalSpace="md" />
            </>
          )}
        </>
      )}

      {hasCbor && <CborContent cbor={cbor!} />}
    </View>
  )
}

const TimingSection = ({tx}: {tx: FormattedTx}) => {
  const {palette: p} = useTheme()
  const strings = useStrings()
  const intl = useIntl()
  const {wallet} = useSelectedWallet()

  const ttlDate = React.useMemo(() => {
    if (tx.ttl == null || !wallet) return null
    return slotToDate(tx.ttl, wallet.networkManager.eras)
  }, [tx.ttl, wallet])

  const validityIntervalStartDate = React.useMemo(() => {
    if (tx.validityIntervalStart == null || !wallet) return null
    return slotToDate(tx.validityIntervalStart, wallet.networkManager.eras)
  }, [tx.validityIntervalStart, wallet])

  return (
    <View>
      {tx.validityIntervalStart != null && (
        <View style={[a.flex_col, a.gap_sm]}>
          <View style={[a.flex_row, a.justify_between, a.align_center]}>
            <Text style={[a.body_2_md_medium, {color: p.text_gray_medium}]}>
              {strings.txReview.details.validityIntervalStart}
            </Text>
            <Text style={[a.body_2_md_regular, {color: p.text_gray_medium}]}>
              Slot {tx.validityIntervalStart.toLocaleString('en-US')}
            </Text>
          </View>
          {validityIntervalStartDate && (
            <View style={[a.flex_row, a.justify_end]}>
              <Text style={[a.body_2_md_regular, {color: p.text_gray_low}]}>
                {formatDateAndTime(
                  validityIntervalStartDate.toISOString(),
                  intl,
                )}
              </Text>
            </View>
          )}
        </View>
      )}

      <Space.Height.lg />

      {tx.ttl != null && (
        <View style={[a.flex_col, a.gap_sm]}>
          <View style={[a.flex_row, a.justify_between, a.align_center]}>
            <Text style={[a.body_2_md_medium, {color: p.text_gray_medium}]}>
              {strings.txReview.details.ttl}
            </Text>
            <Text style={[a.body_2_md_regular, {color: p.text_gray_medium}]}>
              Slot {tx.ttl.toLocaleString('en-US')}
            </Text>
          </View>
          {ttlDate && (
            <View style={[a.flex_row, a.justify_end]}>
              <Text style={[a.body_2_md_regular, {color: p.text_gray_low}]}>
                {formatDateAndTime(ttlDate.toISOString(), intl)}
              </Text>
            </View>
          )}
        </View>
      )}
    </View>
  )
}

/**
 * Converts an absolute slot number to a Date using the network eras configuration
 */
function slotToDate(
  absoluteSlot: number,
  eras: ReadonlyArray<Network.EraConfig>,
): Date | null {
  try {
    let slotsRemaining = absoluteSlot

    for (let i = 0; i < eras.length; i++) {
      const era = eras[i]!
      const eraStart = era.start
      // Handle case where end might be undefined (even though type says it's required)
      const eraEnd =
        (era as {end?: Date}).end ??
        new Date(Date.now() + 100 * 365 * 24 * 60 * 60 * 1000) // Far future if no end

      // Calculate how many slots are in this era
      const slotsInEra = Math.floor(
        (eraEnd.getTime() - eraStart.getTime()) / 1000 / era.slotInSeconds,
      )

      if (slotsRemaining <= slotsInEra) {
        // The slot is in this era
        const secondsInEra = slotsRemaining * era.slotInSeconds
        return new Date(eraStart.getTime() + secondsInEra * 1000)
      }

      // Move to next era
      slotsRemaining -= slotsInEra
    }

    // If we've gone through all eras, use the last era's configuration
    const lastEra = eras[eras.length - 1]
    if (lastEra) {
      const secondsInEra = slotsRemaining * lastEra.slotInSeconds
      return new Date(lastEra.start.getTime() + secondsInEra * 1000)
    }

    return null
  } catch (error) {
    // If conversion fails, return null to gracefully degrade
    return null
  }
}

const NetworkSection = ({tx}: {tx: FormattedTx}) => {
  const {palette: p} = useTheme()
  const strings = useStrings()

  if (tx.networkId == null) {
    return null
  }

  const networkName =
    tx.networkId === 0
      ? 'Mainnet'
      : tx.networkId === 1
        ? 'Testnet'
        : `Network ${tx.networkId}`

  return (
    <View>
      <Text style={[a.body_1_lg_medium, {color: p.text_gray_medium}]}>
        {strings.txReview.details.network}
      </Text>
      <Space.Height.md />
      <View style={[a.flex_row, a.justify_between, a.align_center]}>
        <Text style={[a.body_2_md_medium, {color: p.text_gray_medium}]}>
          {strings.txReview.details.networkId}
        </Text>
        <Text style={[a.body_2_md_regular, {color: p.text_gray_medium}]}>
          {networkName} ({tx.networkId})
        </Text>
      </View>
    </View>
  )
}

const MetadataContent = ({
  metadata,
  hash,
  allLabels,
  scripts,
}: {
  metadata: FormattedMetadata['metadata']
  hash: FormattedMetadata['hash']
  allLabels?: FormattedMetadata['allLabels']
  scripts?: FormattedMetadata['scripts']
}) => {
  const {palette: p} = useTheme()
  const strings = useStrings()

  const hasMetadata = metadata != null || allLabels != null
  const hasScripts = scripts != null && scripts.length > 0

  const metadataFormatted = metadata
    ? JSON.stringify(metadata, null, 2)
    : allLabels
      ? JSON.stringify(allLabels, null, 2)
      : null

  return (
    <View>
      {hash != null && (
        <View>
          <View style={[a.flex_row, a.justify_between, a.align_center]}>
            <Text style={[a.body_2_md_regular, {color: p.text_gray_low}]}>
              {strings.txReview.metadata.metadataHash}
            </Text>
            <Copiable text={hash} style={a.flex_1}>
              <Text
                style={[
                  a.flex_1,
                  a.body_2_md_regular,
                  {color: p.text_gray_medium},
                  a.text_right,
                ]}
                numberOfLines={1}
                ellipsizeMode="middle"
              >
                {hash}
              </Text>
            </Copiable>
          </View>
        </View>
      )}

      {hasMetadata && metadataFormatted && (
        <>
          {hash != null && <Space.Height.lg />}
          <View>
            <View style={[a.flex_row, a.justify_between, a.align_center]}>
              <Text style={[a.body_1_lg_medium, {color: p.text_gray_medium}]}>
                {allLabels
                  ? strings.txReview.metadata.allMetadataLabels
                  : strings.txReview.metadata.metadataJsonLabel}
              </Text>
              <Copiable text={metadataFormatted} />
            </View>
            <Space.Height.md />
            <View
              style={[{backgroundColor: p.bg_color_min}, a.rounded_sm, a.p_lg]}
            >
              <Text
                style={[a.body_2_md_regular, {color: p.text_gray_medium}]}
                selectable
              >
                {metadataFormatted}
              </Text>
            </View>
          </View>
        </>
      )}

      {hasScripts && (
        <>
          {hasMetadata && <Space.Height.lg />}
          <View>
            <Text style={[a.body_1_lg_medium, {color: p.text_gray_medium}]}>
              {strings.txReview.metadata.scripts} ({scripts!.length})
            </Text>
            <Space.Height.md />
            {scripts!.map((script, index) => (
              <View key={index}>
                {index > 0 && <Space.Height.md />}
                <View style={[a.flex_col, a.gap_sm]}>
                  <View style={[a.flex_row, a.justify_between, a.align_center]}>
                    <Text
                      style={[a.body_2_md_medium, {color: p.text_gray_medium}]}
                    >
                      {strings.txReview.metadata.scriptHash}
                    </Text>
                    <Copiable text={script.scriptHash} style={a.flex_1}>
                      <Text
                        style={[
                          a.flex_1,
                          a.body_2_md_regular,
                          {color: p.text_gray_medium},
                          a.text_right,
                        ]}
                        numberOfLines={1}
                        ellipsizeMode="middle"
                      >
                        {script.scriptHash}
                      </Text>
                    </Copiable>
                  </View>
                  <View style={[a.flex_row, a.justify_between, a.align_center]}>
                    <Text
                      style={[a.body_2_md_medium, {color: p.text_gray_medium}]}
                    >
                      {strings.txReview.metadata.scriptBytes}
                    </Text>
                    <Copiable text={script.scriptBytes} style={a.flex_1}>
                      <Text
                        style={[
                          a.flex_1,
                          a.body_2_md_regular,
                          {color: p.text_gray_medium},
                          a.text_right,
                        ]}
                        numberOfLines={2}
                        ellipsizeMode="middle"
                      >
                        {script.scriptBytes.slice(0, 64)}...
                      </Text>
                    </Copiable>
                  </View>
                </View>
              </View>
            ))}
          </View>
        </>
      )}
    </View>
  )
}

const CborContent = ({cbor}: {cbor: string}) => {
  const {palette: p} = useTheme()

  return (
    <View>
      <View style={[a.flex_row, a.justify_between, a.align_center]}>
        <Text style={[a.body_1_lg_medium, {color: p.text_gray_medium}]}>
          CBOR
        </Text>
        <Copiable text={cbor} />
      </View>
      <Space.Height.md />
      <View style={[{backgroundColor: p.bg_color_min}, a.rounded_sm, a.p_lg]}>
        <Text
          style={[a.body_2_md_regular, {color: p.text_gray_medium}]}
          selectable
        >
          {cbor}
        </Text>
      </View>
      <Space.Height.lg />
    </View>
  )
}
