export type Track<
  EventNames extends string,
  EventName extends EventNames,
  Properties = {},
> = {
  event: EventName
  metadata?: Properties
}
