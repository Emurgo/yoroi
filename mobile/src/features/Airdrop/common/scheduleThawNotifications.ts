import * as Notifications from 'expo-notifications'
import {Alert} from 'react-native'

import {
  getNotificationsAuthorizationStatus,
  triggerNotificationsPermissionModal,
} from '~/features/Notifications/common/tools'
import {isAndroid} from '~/kernel/constants'
import {logger} from '~/kernel/logger/logger'

import type {AddressAllocation, Thaw} from '../types'

const AIRDROP_NOTIFICATION_PREFIX = 'airdrop_thaw_'

/**
 * Creates a unique identifier for a thaw notification based on address and thaw time
 */
const getThawNotificationId = (address: string, thawDate: Date): string => {
  // Use address hash and timestamp to create unique ID
  const addressHash = address.slice(-8) // Last 8 chars of address
  const timestamp = thawDate.getTime()
  return `${AIRDROP_NOTIFICATION_PREFIX}${addressHash}_${timestamp}`
}

/**
 * Checks if a notification is already scheduled for a specific thaw time
 */
const isThawNotificationScheduled = async (
  address: string,
  thawDate: Date,
): Promise<boolean> => {
  try {
    const scheduledNotifications =
      await Notifications.getAllScheduledNotificationsAsync()
    const expectedId = getThawNotificationId(address, thawDate)

    return scheduledNotifications.some((notification) => {
      const notificationId = notification.identifier
      return notificationId === expectedId
    })
  } catch (error) {
    logger.error('Failed to check scheduled notifications', {error})
    return false
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
 * Gets all upcoming thaws from all allocations
 */
const getUpcomingThaws = (
  allocations: ReadonlyArray<AddressAllocation>,
): Array<{allocation: AddressAllocation; thaw: Thaw; thawDate: Date}> => {
  const now = new Date()
  const upcomingThaws: Array<{
    allocation: AddressAllocation
    thaw: Thaw
    thawDate: Date
  }> = []

  for (const allocation of allocations) {
    for (const thaw of allocation.schedule.thaws) {
      // Only schedule for upcoming thaws that haven't started
      if (thaw.status === 'upcoming') {
        try {
          const thawDate = new Date(
            thaw.thawing_period_start.replace(/\s/g, ''),
          )
          if (thawDate > now) {
            upcomingThaws.push({allocation, thaw, thawDate})
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

  // Sort by date (earliest first)
  return upcomingThaws.sort(
    (a, b) => a.thawDate.getTime() - b.thawDate.getTime(),
  )
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

    // Get all upcoming thaws
    const upcomingThaws = getUpcomingThaws(allocations)

    if (upcomingThaws.length === 0) {
      Alert.alert(
        'No Upcoming Thaws',
        'There are no upcoming thaws to schedule notifications for.',
      )
      return {scheduled: 0, skipped: 0, errors: 0}
    }

    // Schedule notifications for each thaw
    for (const {allocation, thaw, thawDate} of upcomingThaws) {
      try {
        // Check if already scheduled
        const alreadyScheduled = await isThawNotificationScheduled(
          allocation.address,
          thawDate,
        )

        if (alreadyScheduled) {
          skipped++
          continue
        }

        // Schedule the notification
        const notificationId = getThawNotificationId(
          allocation.address,
          thawDate,
        )
        const amount = (thaw.amount / Math.pow(10, 6)).toFixed(2) // NIGHT has 6 decimals

        await Notifications.scheduleNotificationAsync({
          identifier: notificationId,
          content: {
            title: 'Airdrop Thaw Available',
            body: `${amount} NIGHT tokens are now available to redeem`,
            sound: 'default',
            data: {
              type: 'airdrop_thaw',
              address: allocation.address,
              thawDate: thawDate.toISOString(),
              amount: thaw.amount,
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
          address: allocation.address,
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
