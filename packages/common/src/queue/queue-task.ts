import {App} from '@yoroi/types'
import {freeze} from 'immer'
import {Subject, from, of} from 'rxjs'
import {catchError, concatMap} from 'rxjs/operators'

export const queueTaskMaker = (): App.QueueTaskManager => {
  const queueSubject = new Subject<App.QueueTask>()

  const subscription = queueSubject
    .pipe(
      concatMap((task) =>
        from(task()).pipe(catchError(() => of(App.Errors.InvalidState))),
      ),
    )
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
