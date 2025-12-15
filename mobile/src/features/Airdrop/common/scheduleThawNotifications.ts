import * as Notifications from 'expo-notifications'
import {Alert} from 'react-native'

import {
  getNotificationsAuthorizationStatus,
  triggerNotificationsPermissionModal,
} from '~/features/Notifications/common/tools'
import {isAndroid} from '~/kernel/constants'
import {logger} from '~/kernel/logger/logger'

import type {AddressAllocation} from '../types'

const AIRDROP_NOTIFICATION_PREFIX = 'airdrop_thaw_'

/**
 * Creates a unique identifier for a thaw notification based on thaw date only
 */
const getThawNotificationId = (thawDate: Date): string => {
  // Use timestamp to create unique ID per date
  const timestamp = thawDate.getTime()
  return `${AIRDROP_NOTIFICATION_PREFIX}${timestamp}`
}

/**
 * Gets all existing scheduled notification IDs for airdrop thaws
 */
const getExistingThawNotificationIds = async (): Promise<Set<string>> => {
  try {
    const scheduledNotifications =
      await Notifications.getAllScheduledNotificationsAsync()
    const existingIds = new Set<string>()

    for (const notification of scheduledNotifications) {
      if (notification.identifier.startsWith(AIRDROP_NOTIFICATION_PREFIX)) {
        existingIds.add(notification.identifier)
      }
    }

    return existingIds
  } catch (error) {
    logger.error('Failed to get existing scheduled notifications', {error})
    return new Set<string>()
  }
}

/**
 * Sets up notification handler and Android channel if needed
 */
const setupNotificationSystem = async (): Promise<void> => {
  // Set up notification handler
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  })

  // Create Android channel if needed
  if (isAndroid) {
    await Notifications.setNotificationChannelAsync('airdrop', {
      name: 'Airdrop Thaws',
      importance: Notifications.AndroidImportance.HIGH,
      description: 'Notifications for when airdrop thaws become available',
    })
  }
}

/**
 * Gets unique upcoming thaw dates from all allocations
 */
const getUniqueUpcomingThawDates = (
  allocations: ReadonlyArray<AddressAllocation>,
): Array<Date> => {
  const now = new Date()
  const thawDates = new Set<number>()

  for (const allocation of allocations) {
    for (const thaw of allocation.schedule.thaws) {
      // Only schedule for upcoming thaws that haven't started
      if (thaw.status === 'upcoming') {
        try {
          const thawDate = new Date(
            thaw.thawing_period_start.replace(/\s/g, ''),
          )
          if (thawDate > now) {
            // Use timestamp as key to ensure uniqueness per date
            thawDates.add(thawDate.getTime())
          }
        } catch (error) {
          logger.error('Failed to parse thaw date', {
            address: allocation.address,
            thawDate: thaw.thawing_period_start,
            error,
          })
        }
      }
    }
  }

  // Convert back to Date objects and sort by date (earliest first)
  return Array.from(thawDates)
    .map((timestamp) => new Date(timestamp))
    .sort((a, b) => a.getTime() - b.getTime())
}

/**
 * Schedules notifications for all upcoming thaws
 */
export const scheduleThawNotifications = async (
  allocations: ReadonlyArray<AddressAllocation>,
): Promise<{scheduled: number; skipped: number; errors: number}> => {
  let scheduled = 0
  let skipped = 0
  let errors = 0

  try {
    // Check and request permissions
    const authStatus = await getNotificationsAuthorizationStatus()
    if (authStatus !== 'authorized') {
      await triggerNotificationsPermissionModal()
      const newStatus = await getNotificationsAuthorizationStatus()
      if (newStatus !== 'authorized') {
        Alert.alert(
          'Permission Required',
          'Notification permission is required to schedule thaw reminders.',
        )
        return {scheduled: 0, skipped: 0, errors: 0}
      }
    }

    // Set up notification system
    await setupNotificationSystem()

    // Get unique upcoming thaw dates
    const uniqueThawDates = getUniqueUpcomingThawDates(allocations)

    if (uniqueThawDates.length === 0) {
      Alert.alert(
        'No Upcoming Thaws',
        'There are no upcoming thaws to schedule notifications for.',
      )
      return {scheduled: 0, skipped: 0, errors: 0}
    }

    // Get all existing scheduled notification IDs once
    const existingNotificationIds = await getExistingThawNotificationIds()

    // Schedule one notification per unique date
    for (const thawDate of uniqueThawDates) {
      try {
        // Check if already scheduled using the pre-fetched Set
        const notificationId = getThawNotificationId(thawDate)
        if (existingNotificationIds.has(notificationId)) {
          skipped++
          continue
        }

        // Schedule the notification
        await Notifications.scheduleNotificationAsync({
          identifier: notificationId,
          content: {
            title: 'Airdrop Thaw Available',
            body: 'Thaw available',
            sound: 'default',
            data: {
              type: 'airdrop_thaw',
              thawDate: thawDate.toISOString(),
            },
          },
          trigger: {
            type: 'date',
            date: thawDate,
          } as Notifications.DateTriggerInput,
        })

        scheduled++
      } catch (error) {
        logger.error('Failed to schedule thaw notification', {
          thawDate: thawDate.toISOString(),
          error,
        })
        errors++
      }
    }

    if (errors > 0) {
      logger.warn('Some notifications failed to schedule', {errors})
    }
  } catch (error) {
    logger.error('Failed to schedule thaw notifications', {error})
    throw error
  }

  return {scheduled, skipped, errors}
}
