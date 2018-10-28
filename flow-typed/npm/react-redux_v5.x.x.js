// Local modification by PPershing
// original definition does not work well with
// recompose
declare module 'react-redux' {
  // Copied from recompose as imports between declarations
  // might not work properly
  declare type UnaryFn<A, R> = (a: A) => R;

  declare type Component<A> = React$ComponentType<A>;

  declare type HOC<Base, Enhanced> = UnaryFn<
    Component<Base>,
    Component<Enhanced>,
  >;

  // And here we go with the definition.
  // Note that this does not support
  // connect(null, dispatchProps) signature,
  // you have to use empty '()=>({})' mapStateToProps
  // instead...
  declare export function connect<ExternalProps, State, Mapper, Actions>(
    mapStateToProps: Mapper,
    mapDispatchToProps: Actions,
  ): HOC<
    {|
      ...$Exact<ExternalProps>,
      ...$Exact<$Call<Mapper, State, ExternalProps>>,
      ...Actions,
    |},
    ExternalProps,
  >;
}
