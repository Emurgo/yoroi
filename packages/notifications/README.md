# Notifications package for Yoroi

The `@yoroi/notifications` package handles local notifications within the Yoroi wallet app, ensuring users are alerted to important events like balance changes, and transactions.
This package does not contain any environment-specific code, so it can be used in both web and mobile environments.

## Usage
1. Create a transaction received subject and push notifications to it whenever a transaction is received.
```ts
const transactionReceivedSubject = new Subject<NotificationTypes.TransactionReceivedEvent>()
```

2. Create a notification manager with the necessary configuration.
```ts
export const notificationManager = notificationManagerMaker({
  eventsStorage: appStorage.join('events/'),
  configStorage: appStorage.join('settings/'),
  display: displayNotificationEvent,
  subscriptions: {
    [Notifications.Trigger.TransactionReceived]: transactionReceivedSubject,
  },
})

```
3. Initialize the notification manager.
```ts
notificationManager.hydrate()
```

4. Destroy the notification manager when it is no longer needed.
```ts
notificationManager.destroy()
```

For background notifications in react-native, the UI needs to define a background task using `expo-task-manager` and `expo-background-fetch`.


## Details

**Notification Types**
- Local Notifications: Generated by the app on the device, useful for in-app alerts like transaction updates.
- Push Notifications: Sent from a server, useful for real-time updates such as token price changes.

**Key Features**
- Event Configuration: Users can customize which notifications to receive.
- Persistence: Notifications are logged and accessible later, even if not immediately displayed.
- Permissions: The app manages notification permissions based on platform guidelines.

**Use Cases**
- Local: Balance changes, received transactions, rewards updates.
- Push: Significant token and ADA price changes.

**Version 1.0**

Initial version includes local notifications only.

**Debug**
- To debug notifications in the background, you can force a background sync by following instructions from https://docs.expo.dev/versions/latest/sdk/background-fetch/ 