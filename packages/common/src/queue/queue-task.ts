import {App} from '@yoroi/types'
import {freeze} from 'immer'
import {Subject} from 'rxjs'
import {concatMap} from 'rxjs/operators'

export const queueTaskMaker = (): App.QueueTaskManager => {
  const queueSubject = new Subject<App.QueueTask>()

  const subscription = queueSubject
    .pipe(concatMap((task) => task()))
    .subscribe()

  const enqueue = (task: App.QueueTask) => {
    queueSubject.next(task)
  }

  const destroy = () => {
    subscription.unsubscribe()
    queueSubject.complete()
  }

  return freeze({enqueue, destroy}, true)
}
