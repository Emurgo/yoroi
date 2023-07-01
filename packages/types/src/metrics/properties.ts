export type MetricsTrackProperties<
  EventNames extends string,
  EventName extends EventNames,
  Properties = {} | undefined,
> = Properties extends undefined
  ? {
      event: EventName
      properties?: never
    }
  : {
      event: EventName
      properties: Properties
    }
