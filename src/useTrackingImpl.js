import { useCallback, useContext, useEffect, useMemo } from 'react';
import merge from 'deepmerge';

import ReactTrackingContext from './ReactTrackingContext';
import dispatchTrackingEvent from './dispatchTrackingEvent';

function useTrackingImpl(
  trackingData = {},
  { dispatch = dispatchTrackingEvent, dispatchOnMount = false, process } = {},
  props
) {
  const { tracking } = useContext(ReactTrackingContext);

  const getProcessFn = useCallback(() => tracking && tracking.process, []);

  const getOwnTrackingData = useCallback(() => {
    const ownTrackingData =
      typeof trackingData === 'function' ? trackingData(props) : trackingData;
    return ownTrackingData || {};
  }, [trackingData, props]);

  const getTrackingDataFn = useCallback(() => {
    const contextGetTrackingData =
      (tracking && tracking.getTrackingData) || getOwnTrackingData;

    return () =>
      contextGetTrackingData === getOwnTrackingData
        ? getOwnTrackingData()
        : merge(contextGetTrackingData(), getOwnTrackingData());
  }, [getOwnTrackingData]);

  const getTrackingDispatcher = useCallback(() => {
    const contextDispatch = (tracking && tracking.dispatch) || dispatch;
    return data => contextDispatch(merge(getOwnTrackingData(), data || {}));
  }, [dispatch, getOwnTrackingData]);

  const trackEvent = useCallback(
    (data = {}) => {
      getTrackingDispatcher()(data);
    },
    [getTrackingDispatcher]
  );

  useEffect(() => {
    const contextProcess = getProcessFn();
    const getTrackingData = getTrackingDataFn();

    if (getProcessFn() && process) {
      // eslint-disable-next-line
      console.error(
        '[react-tracking] options.process should be defined once on a top-level component'
      );
    }

    if (
      typeof contextProcess === 'function' &&
      typeof dispatchOnMount === 'function'
    ) {
      trackEvent(
        merge(
          contextProcess(getOwnTrackingData()) || {},
          dispatchOnMount(getTrackingData()) || {}
        )
      );
    } else if (typeof contextProcess === 'function') {
      const processed = contextProcess(getOwnTrackingData());
      if (processed || dispatchOnMount === true) {
        trackEvent(processed);
      }
    } else if (typeof dispatchOnMount === 'function') {
      trackEvent(dispatchOnMount(getTrackingData()));
    } else if (dispatchOnMount === true) {
      trackEvent();
    }
  }, []);

  const dependencies = [
    trackEvent,
    getTrackingDispatcher,
    getTrackingDataFn,
    getProcessFn,
    process,
  ];

  return useMemo(
    () => ({
      contextValue: {
        tracking: {
          dispatch: getTrackingDispatcher(),
          getTrackingData: getTrackingDataFn(),
          process: getProcessFn() || process,
        },
      },
      tracking: {
        trackEvent,
        getTrackingData: getTrackingDataFn(),
      },
    }),
    dependencies
  );
}

export default useTrackingImpl;
