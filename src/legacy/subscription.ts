/* eslint-disable @typescript-eslint/no-explicit-any */
import assert from './assert'
// simple subscription implementation
// Note(ppershing): RxJS overvables are probably too much overkill
// for our use-cases and EventEmitter emits untyped events so it is hard
// to statically check. We also auto-bind methods

export class SubscriptionManager<T> {
  _subscriptions: Array<(T) => any> = []

  // We cannot use arrow property initializers because of Flow, see
  // https://stackoverflow.com/questions/49170385/flow-generics-incompatible-types

  constructor() {
    this.subscribe = this.subscribe.bind(this)

    this.unsubscribe = this.unsubscribe.bind(this)

    this.notify = this.notify.bind(this)
  }

  subscribe(handler: (data: T) => any) {
    this._subscriptions.push(handler)
    return handler
  }

  unsubscribe(handler: (data: T) => any) {
    assert.assert(this._subscriptions.includes(handler), 'Handler is not subscribed')
    this._subscriptions = this._subscriptions.filter((h) => h !== handler)
  }

  notify(data: T) {
    this._subscriptions.forEach((handler) => handler(data))
  }
}
