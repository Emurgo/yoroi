import {useTheme} from '@yoroi/theme'
import {Portfolio, Swap} from '@yoroi/types'
import React from 'react'
import {ErrorBoundary} from 'react-error-boundary'
import {useIntl} from 'react-intl'
import {FlatList, Linking, StyleSheet, Text, TouchableOpacity, View} from 'react-native'
import SkeletonPlaceholder from 'react-native-skeleton-placeholder'

import {Boundary} from '../../../../components/Boundary/Boundary'
import {Button, ButtonType} from '../../../../components/Button/Button'
import {Icon} from '../../../../components/Icon'
import {useModal} from '../../../../components/Modal/ModalContext'
import {Space} from '../../../../components/Space/Space'
import {useWalletNavigation} from '../../../../kernel/navigation'
import {TokenInfoIcon} from '../../../Portfolio/common/TokenAmountItem/TokenInfoIcon'
import {useSearch, useSearchOnNavBar} from '../../../Search/SearchContext'
import {useWalletManager} from '../../../WalletManager/context/WalletManagerProvider'
import {Counter} from '../../common/Counter/Counter'
import {EmptyCompletedOrdersIllustration} from '../../common/Illustrations/EmptyCompletedOrdersIllustration'
import {EmptyOpenOrdersIllustration} from '../../common/Illustrations/EmptyOpenOrdersIllustration'
import {ServiceUnavailable} from '../../common/ServiceUnavailable/ServiceUnavailable'
import {useStrings} from '../../common/strings'
import {SwapInfoLink} from '../../common/SwapInfoLink/SwapInfoLink'
import {useSwap} from '../../common/SwapProvider'

type Filter = 'open' | 'completed'

export const ListOrders = () => {
  const {navigateToTxHistory} = useWalletNavigation()
  const [filter, setFilter] = React.useState<Filter>('open')

  const strings = useStrings()
  const {styles, color} = useStyles()

  useSearchOnNavBar({
    placeholder: strings.searchTokens,
    title: strings.swapTitle,
    isChild: true,
    onBack: navigateToTxHistory,
  })

  return (
    <View style={styles.root}>
      <View style={styles.group}>
        <View>
          <Button
            onPress={() => setFilter('open')}
            type={ButtonType.SecondaryText}
            title={strings.openOrders}
            size="S"
            {...(filter === 'open' && {style: styles.activeButton})}
          />
        </View>

        <View>
          <Button
            onPress={() => setFilter('completed')}
            type={ButtonType.SecondaryText}
            title={strings.completedOrders}
            size="S"
            {...(filter === 'completed' && {style: styles.activeButton})}
          />
        </View>
      </View>

      <Boundary
        loading={{
          fallback: (
            <View style={styles.list}>
              {[0, 1, 2, 3].map((index) => (
                <React.Fragment key={index}>
                  <SkeletonPlaceholder
                    borderRadius={8}
                    backgroundColor={color.gray_100}
                    highlightColor={color.gray_200}
                    speed={1000}
                  >
                    <View style={{height: 140}} />
                  </SkeletonPlaceholder>
                </React.Fragment>
              ))}
            </View>
          ),
        }}
      >
        <ErrorBoundary
          fallbackRender={({resetErrorBoundary}) => <ServiceUnavailable resetErrorBoundary={resetErrorBoundary} />}
        >
          <Content filter={filter} />
        </ErrorBoundary>
      </Boundary>
    </View>
  )
}

const Content = ({filter}: {filter: Filter}) => {
  const strings = useStrings()
  const {styles} = useStyles()
  const {visible: isSearching} = useSearch()
  const swapForm = useSwap()
  const orders = swapForm.orders?.filter(
    ({status}) => (status === 'open' && filter === 'open') || (status !== 'open' && filter === 'completed'),
  )

  return (
    <View style={styles.flex}>
      <View style={styles.flex}>
        <FlatList
          contentContainerStyle={styles.list}
          data={orders}
          renderItem={({item}) => <Order order={item} />}
          keyExtractor={(item) => item.txHash ?? item.customId ?? ''}
          ListEmptyComponent={<ListEmptyComponent filter={filter} />}
        />
      </View>

      {!isSearching && (
        <Counter
          openingText={strings.youHave}
          counter={orders?.length ?? 0}
          closingText={filter === 'open' ? strings.listOpenOrders : strings.listCompletedOrders}
        />
      )}
    </View>
  )
}

const tokenName = (token?: Portfolio.Token.Info) => token?.ticker ?? token?.name ?? token?.id ?? '-'

const Order = ({order}: {order: Swap.Order}) => {
  const intl = useIntl()
  const strings = useStrings()
  const {
    selected: {
      networkManager: {explorers},
    },
  } = useWalletManager()
  const {styles, color} = useStyles()
  const [expanded, setExpanded] = React.useState<boolean>(false)
  const swapForm = useSwap()
  const tokenInInfo = swapForm.tokenInfos.get(order.tokenIn)
  const tokenOutInfo = swapForm.tokenInfos.get(order.tokenOut)

  const amountOut = order.actualAmountOut === 0 ? order.expectedAmountOut : order.actualAmountOut
  const price = amountOut === 0 ? 0 : order.amountIn / amountOut

  const amountOutStr = `${Number(amountOut.toFixed(tokenOutInfo?.decimals ?? 0))} ${tokenName(tokenOutInfo)}`
  const priceStr = `${Number(price.toFixed(tokenOutInfo?.decimals ?? 0))} ${tokenName(tokenInInfo)}/${tokenName(
    tokenOutInfo,
  )}`

  const lastTxHash = order.updateTxHash ?? order.txHash ?? ''
  const shortenedTxHash = `${lastTxHash.substring(0, 9)}...${lastTxHash.substring(
    lastTxHash.length - 4,
    lastTxHash.length,
  )}`

  return (
    <View style={styles.card}>
      <TouchableOpacity onPress={() => setExpanded(!expanded)}>
        <View style={styles.cardHeader}>
          <View style={styles.composedText}>
            <TokenInfoIcon info={tokenInInfo} size="sm" />

            <Text style={styles.heading}>{tokenName(tokenInInfo)}</Text>

            <Text style={styles.heading}>/</Text>

            <TokenInfoIcon info={tokenOutInfo} size="sm" />

            <Text style={styles.heading}>{tokenName(tokenOutInfo)}</Text>
          </View>

          <Icon.Chevron direction={expanded ? 'up' : 'down'} color={color.el_gray_max} size={24} />
        </View>
      </TouchableOpacity>

      <View style={styles.list}>
        <Row label={strings.listOrdersSheetAssetPrice} value={priceStr} />

        <Row label={strings.listOrdersSheetAssetAmount} value={amountOutStr} />

        {order.placedAt !== undefined && (
          <Row
            label={strings.listOrdersTimeCreated}
            value={intl.formatDate(new Date(order.placedAt), {
              dateStyle: 'medium',
              timeStyle: 'short',
            })}
          />
        )}

        {order.lastUpdate !== undefined && (
          <Row
            label={strings.listOrdersTimeCompleted}
            value={intl.formatDate(new Date(order.lastUpdate), {
              dateStyle: 'medium',
              timeStyle: 'short',
            })}
          />
        )}

        {expanded && (
          <React.Fragment>
            <Row label={strings.listOrdersTotal} value={`${order.amountIn} ${tokenName(tokenInInfo)}`} />

            <Row label={strings.dex.toUpperCase()} value={order.dex} />

            {lastTxHash !== '' && (
              <Row
                label={strings.listOrdersTxId}
                value={
                  <Button
                    type={ButtonType.Link}
                    style={styles.inlineLink}
                    onPress={() => Linking.openURL(explorers.cexplorer.tx(lastTxHash))}
                    title={shortenedTxHash}
                  />
                }
              />
            )}
          </React.Fragment>
        )}

        {order.status === 'open' && tokenInInfo && (
          <OrderCancellation order={order} tokenInInfo={tokenInInfo} price={priceStr} amount={amountOutStr} />
        )}
      </View>
    </View>
  )
}

const OrderCancellation = ({
  order,
  tokenInInfo,
  price,
  amount,
}: {
  order: Swap.Order
  tokenInInfo: Portfolio.Token.Info
  price: string
  amount: string
}) => {
  const strings = useStrings()
  const {styles} = useStyles()
  const {openModal, closeModal} = useModal()
  // TODO
  const onOrderCancelConfirm = () => null

  const onPress = React.useCallback(
    () =>
      openModal(
        strings.listOrdersSheetTitle,
        <View style={styles.root}>
          <Row label={strings.listOrdersSheetAssetPrice} value={price} />

          <Row label={strings.listOrdersSheetAssetAmount} value={amount} />

          <Row label={strings.listOrdersSheetTotalReturned} value={`${order.amountIn} ${tokenName(tokenInInfo)}`} />

          <Row label={strings.listOrdersSheetCancellationFee} value="" />

          <SwapInfoLink />

          <Space fill />

          <View style={styles.group}>
            <Button type={ButtonType.Secondary} title={strings.listOrdersSheetBack} onPress={closeModal} />

            <Button type={ButtonType.Critical} title={strings.listOrdersSheetConfirm} onPress={onOrderCancelConfirm} />
          </View>
        </View>,
        400,
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [amount, closeModal, openModal, order.amountIn, price, tokenInInfo],
  )
  return (
    <Button
      style={styles.cancelButton}
      type={ButtonType.SecondaryText}
      title={strings.listOrdersSheetButtonText}
      onPress={onPress}
    />
  )
}

const Row = ({label, value}: {label: string; value: string | React.ReactNode}) => {
  const {styles} = useStyles()

  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>

      {typeof value === 'string' ? <Text style={styles.rowValue}>{value}</Text> : value}
    </View>
  )
}

const ListEmptyComponent = ({filter}: {filter: Filter}) => {
  const {search: assetSearchTerm, visible: isSearching} = useSearch()
  const strings = useStrings()
  const {styles} = useStyles()

  return (
    <View style={styles.notOrdersYetContainer}>
      {filter === 'open' ? (
        <React.Fragment>
          <EmptyOpenOrdersIllustration style={styles.illustration} />

          <Text style={styles.contentText}>
            {isSearching ? `${strings.emptySearchOpenOrders} "${assetSearchTerm}"` : strings.emptyOpenOrders}
          </Text>

          {!isSearching && <Text style={styles.contentSubText}>{strings.emptyOpenOrdersSub}</Text>}
        </React.Fragment>
      ) : (
        <React.Fragment>
          <EmptyCompletedOrdersIllustration style={styles.illustration} />

          <Text style={styles.contentText}>
            {isSearching ? `${strings.emptySearchCompletedOrders} "${assetSearchTerm}"` : strings.emptyCompletedOrders}
          </Text>
        </React.Fragment>
      )}
    </View>
  )
}

const useStyles = () => {
  const {color, atoms} = useTheme()

  const styles = StyleSheet.create({
    flex: {
      ...atoms.flex_1,
    },
    group: {
      ...atoms.flex_row,
      ...atoms.gap_md,
      ...atoms.justify_center,
    },
    root: {
      ...atoms.flex_1,
      ...atoms.p_lg,
      ...atoms.gap_lg,
      backgroundColor: color.bg_color_max,
    },
    activeButton: {
      backgroundColor: color.el_gray_min,
    },
    list: {
      ...atoms.gap_md,
    },
    illustration: {
      ...atoms.flex_1,
      alignSelf: 'center',
      width: 280,
      height: 224,
    },
    notOrdersYetContainer: {
      ...atoms.flex_1,
      ...atoms.text_center,
      ...atoms.gap_lg,
      ...atoms.pt_2xl,
    },
    contentText: {
      ...atoms.flex_1,
      ...atoms.text_center,
      ...atoms.heading_3_medium,
      color: color.gray_max,
    },
    contentSubText: {
      ...atoms.flex_1,
      ...atoms.text_center,
      color: color.text_gray_low,
      ...atoms.body_1_lg_regular,
    },
    card: {
      ...atoms.p_lg,
      ...atoms.border,
      borderRadius: 8,
      borderColor: color.gray_200,
      backgroundColor: color.bg_color_max,
    },
    cardHeader: {
      ...atoms.flex_row,
      ...atoms.justify_between,
      ...atoms.pb_md,
    },
    composedText: {
      ...atoms.flex_row,
      ...atoms.align_center,
      ...atoms.gap_sm,
    },
    heading: {
      ...atoms.body_1_lg_medium,
      color: color.text_gray_medium,
    },
    row: {
      ...atoms.flex_row,
      ...atoms.justify_between,
    },
    rowLabel: {
      ...atoms.body_1_lg_regular,
      color: color.text_gray_low,
    },
    rowValue: {
      ...atoms.body_1_lg_regular,
      color: color.text_gray_medium,
    },
    inlineLink: {
      padding: 0,
      justifyContent: 'flex-end',
    },
    cancelButton: {
      ...atoms.self_start,
      ...atoms.px_0,
    },
  })
  return {styles, color}
}
