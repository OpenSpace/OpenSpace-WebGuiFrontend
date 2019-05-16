import shallowEqual from 'shallow-equal/objects';

/**
 * Generate a new memoized mapStateToProps function, based on two components:
 * 
 * @param {function} mapStateToProps
 *                   A regular redux mapStateToProps function, except instead of operating
 *                   on the full state, it will only have access to a substate.
 * 
 * @param {function} mapSubStateToSubstate
 *                   A function that takes the global redux state and extracts a substate.
 */ 
export default (mapSubStateToProps, mapStateToSubstate) => () => {
  // This is a second order function in order to generate one
  // cache per component instance, as opposed to a global one.
  let prevSubState = {};
  let prevOwnProps = {};
  let prevProps = {};
  return (state, ownProps) => {
    const subState = mapStateToSubstate(state);
    if (shallowEqual(subState, prevSubState) &&
        shallowEqual(ownProps, prevOwnProps)) {
      return prevProps;
    }
    prevSubState = subState;
    prevOwnProps = ownProps;   
    return prevProps = mapSubStateToProps(subState, ownProps)
  }
}
