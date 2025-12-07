import {atoms as a, useTheme} from '@yoroi/theme'

import * as Notifications from 'expo-notifications'
import * as React from 'react'
import {useIntl} from 'react-intl'
import {
  Alert,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'

import {useStrings} from '~/kernel/i18n/useStrings'
import {logger} from '~/kernel/logger/logger'
import {Icon} from '~/ui/Icon'
import {Space} from '~/ui/Space/Space'

const formatNotificationDate = (
  trigger: Notifications.NotificationTrigger,
  intl: ReturnType<typeof useIntl>,
): string => {
  if (!trigger || trigger === null) {
    return 'Unknown'
  }

  if (typeof trigger !== 'object') {
    return 'Unknown'
  }

  let date: Date | null = null

  // Handle date trigger
  if ('type' in trigger && trigger.type === 'date') {
    const dateTrigger = trigger as {
      type: 'date'
      date?: Date | string | number
      timestamp?: number
    }
    if ('date' in dateTrigger && dateTrigger.date) {
      const dateValue = dateTrigger.date
      if (dateValue instanceof Date) {
        date = dateValue
      } else if (
        typeof dateValue === 'string' ||
        typeof dateValue === 'number'
      ) {
        date = new Date(dateValue)
        if (isNaN(date.getTime())) {
          date = null
        }
      }
    }
    // Check for timestamp (in seconds)
    if (
      !date &&
      'timestamp' in dateTrigger &&
      typeof dateTrigger.timestamp === 'number'
    ) {
      date = new Date(dateTrigger.timestamp * 1000)
      if (isNaN(date.getTime())) {
        date = null
      }
    }
  }

  // Handle timeInterval trigger
  if (!date && 'type' in trigger && trigger.type === 'timeInterval') {
    const intervalTrigger = trigger as {
      type: 'timeInterval'
      seconds?: number
    }
    if (
      'seconds' in intervalTrigger &&
      typeof intervalTrigger.seconds === 'number'
    ) {
      date = new Date(Date.now() + intervalTrigger.seconds * 1000)
    }
  }

  if (date && !isNaN(date.getTime())) {
    return intl.formatDate(date, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  // Log the trigger structure for debugging
  logger.warn('Unknown trigger format', {trigger, triggerType: typeof trigger})
  return 'Unknown'
}

export const ScheduledNotificationsList = () => {
  const {atoms: ta, palette: p} = useTheme()
  const strings = useStrings()
  const intl = useIntl()
  const [scheduledNotifications, setScheduledNotifications] = React.useState<
    Notifications.NotificationRequest[]
  >([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [refreshing, setRefreshing] = React.useState(false)

  const getNotificationDate = (
    notification: Notifications.NotificationRequest,
  ): Date | null => {
    // Try to get date from stored data first
    const data = notification.content.data
    if (data && typeof data === 'object' && 'thawDate' in data) {
      try {
        const thawDateStr = data.thawDate
        if (typeof thawDateStr === 'string') {
          const date = new Date(thawDateStr)
          if (!isNaN(date.getTime())) {
            return date
          }
        }
      } catch (error) {
        logger.warn('Failed to parse thawDate from data', {error})
      }
    }

    // Fallback to trigger
    const trigger = notification.trigger
    if (!trigger || trigger === null || typeof trigger !== 'object') {
      return null
    }

    // Handle date trigger
    if ('type' in trigger && trigger.type === 'date') {
      const dateTrigger = trigger as {
        type: 'date'
        date?: Date | string | number
        timestamp?: number
      }
      if ('date' in dateTrigger && dateTrigger.date) {
        const dateValue = dateTrigger.date
        if (dateValue instanceof Date) {
          return dateValue
        }
        if (typeof dateValue === 'string' || typeof dateValue === 'number') {
          const date = new Date(dateValue)
          if (!isNaN(date.getTime())) {
            return date
          }
        }
      }
      // Check for timestamp (in seconds)
      if (
        'timestamp' in dateTrigger &&
        typeof dateTrigger.timestamp === 'number'
      ) {
        const date = new Date(dateTrigger.timestamp * 1000)
        if (!isNaN(date.getTime())) {
          return date
        }
      }
    }

    // Handle timeInterval trigger
    if ('type' in trigger && trigger.type === 'timeInterval') {
      const intervalTrigger = trigger as {
        type: 'timeInterval'
        seconds?: number
      }
      if (
        'seconds' in intervalTrigger &&
        typeof intervalTrigger.seconds === 'number'
      ) {
        return new Date(Date.now() + intervalTrigger.seconds * 1000)
      }
    }

    return null
  }

  const removeExpiredNotifications = React.useCallback(async () => {
    try {
      const allNotifications =
        await Notifications.getAllScheduledNotificationsAsync()
      const now = Date.now()

      for (const notification of allNotifications) {
        const scheduledDate = getNotificationDate(notification)
        if (scheduledDate && scheduledDate.getTime() <= now) {
          // Notification has passed, remove it
          try {
            await Notifications.cancelScheduledNotificationAsync(
              notification.identifier,
            )
            logger.info('Removed expired scheduled notification', {
              identifier: notification.identifier,
            })
          } catch (error) {
            logger.warn('Failed to remove expired notification', {
              identifier: notification.identifier,
              error,
            })
          }
        }
      }
    } catch (error) {
      logger.warn('Failed to check for expired notifications', {error})
    }
  }, [])

  const loadScheduledNotifications = React.useCallback(async () => {
    try {
      // First, remove any expired notifications
      await removeExpiredNotifications()

      const allNotifications =
        await Notifications.getAllScheduledNotificationsAsync()
      // Sort by date (earliest first)
      const sortedNotifications = [...allNotifications].sort((a, b) => {
        const dateA = getNotificationDate(a)
        const dateB = getNotificationDate(b)
        if (!dateA && !dateB) return 0
        if (!dateA) return 1
        if (!dateB) return -1
        return dateA.getTime() - dateB.getTime()
      })
      setScheduledNotifications(sortedNotifications)
    } catch (error) {
      logger.error('Failed to load scheduled notifications', {error})
      Alert.alert(
        strings.global.error,
        strings.manageNotifications.loadNotificationError,
      )
    } finally {
      setIsLoading(false)
      setRefreshing(false)
    }
  }, [
    strings.global.error,
    strings.manageNotifications.loadNotificationError,
    removeExpiredNotifications,
  ])

  React.useEffect(() => {
    loadScheduledNotifications()
  }, [loadScheduledNotifications])

  // Listen for when notifications are received and remove them
  React.useEffect(() => {
    const subscription = Notifications.addNotificationReceivedListener(
      async (notification) => {
        const identifier = notification.request.identifier

        try {
          await Notifications.cancelScheduledNotificationAsync(identifier)
          logger.info('Removed triggered scheduled notification', {
            identifier,
          })
          // Reload the list to reflect the removal
          await loadScheduledNotifications()
        } catch (error) {
          logger.warn('Failed to remove triggered notification', {
            identifier,
            error,
          })
        }
      },
    )

    return () => {
      subscription.remove()
    }
  }, [loadScheduledNotifications])

  const handleRefresh = React.useCallback(async () => {
    setRefreshing(true)
    await loadScheduledNotifications()
  }, [loadScheduledNotifications])

  const handleRemove = React.useCallback(
    async (identifier: string) => {
      try {
        await Notifications.cancelScheduledNotificationAsync(identifier)
        await loadScheduledNotifications()
      } catch (error) {
        logger.error('Failed to remove notification', {
          identifier,
          error,
        })
        Alert.alert(
          strings.global.error,
          strings.manageNotifications.removeNotificationError,
        )
      }
    },
    [loadScheduledNotifications, strings],
  )

  if (isLoading) {
    return (
      <View style={[a.p_lg, a.align_center, a.justify_center]}>
        <Text style={[a.body_2_md_regular, ta.text_gray_medium]}>
          {strings.manageNotifications.loadingScheduledNotifications}
        </Text>
      </View>
    )
  }

  if (scheduledNotifications.length === 0) {
    return (
      <View style={[a.p_lg, a.align_center, a.justify_center]}>
        <Icon.Bell size={48} color={p.gray_400} />
        <Space.Height.md />
        <Text style={[a.body_2_md_regular, ta.text_gray_medium]}>
          {strings.manageNotifications.noScheduledNotifications}
        </Text>
      </View>
    )
  }

  return (
    <ScrollView
      style={[a.flex_1]}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
      }
    >
      <View style={[a.gap_sm, a.pt_md]}>
        {scheduledNotifications.map((notification) => {
          // Try to get date from stored data first, then from trigger
          let scheduledDate = 'Unknown'
          const data = notification.content.data
          if (data && typeof data === 'object' && 'thawDate' in data) {
            try {
              const thawDateStr = data.thawDate
              if (typeof thawDateStr === 'string') {
                const date = new Date(thawDateStr)
                if (!isNaN(date.getTime())) {
                  scheduledDate = intl.formatDate(date, {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })
                }
              }
            } catch (error) {
              logger.warn('Failed to parse thawDate from data', {error})
            }
          }

          // Fallback to trigger if data doesn't have date
          if (scheduledDate === 'Unknown') {
            scheduledDate = formatNotificationDate(notification.trigger, intl)
          }

          const title = notification.content.title ?? 'Notification'
          const body = notification.content.body ?? ''

          return (
            <View
              key={notification.identifier}
              style={[
                a.p_md,
                a.rounded_sm,
                {
                  borderWidth: 1,
                  borderColor: p.gray_200,
                  backgroundColor: p.gray_min,
                },
              ]}
            >
              <View style={[a.flex_row, a.justify_between, a.align_start]}>
                <View style={[a.flex_1, a.gap_xs]}>
                  <Text style={[a.body_1_lg_medium, ta.text_gray_max]}>
                    {title}
                  </Text>
                  <Text style={[a.body_2_md_regular, ta.text_gray_medium]}>
                    {body}
                  </Text>
                  <Text style={[a.body_3_sm_regular, ta.text_gray_low]}>
                    {strings.manageNotifications.scheduledFor}: {scheduledDate}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => handleRemove(notification.identifier)}
                  hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}
                  style={[a.p_xs]}
                >
                  <Icon.Delete size={20} color={p.gray_600} />
                </TouchableOpacity>
              </View>
            </View>
          )
        })}
      </View>
    </ScrollView>
  )
}
