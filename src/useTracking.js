import React, { useCallback, useContext, useMemo } from 'react';

import ReactTrackingContext from './ReactTrackingContext';
import useTrackingImpl from './useTrackingImpl';

export default function useTracking(trackingData, options) {
  const trackingContext = useContext(ReactTrackingContext);

  if (!(trackingContext && trackingContext.tracking)) {
    throw new Error(
      'Attempting to call `useTracking` ' +
        'without a ReactTrackingContext present. Did you forget to wrap the top of ' +
        'your component tree with `track`?'
    );
  }

  const { contextValue, tracking } = useTrackingImpl(trackingData, options);

  const TrackingProvider = useCallback(
    ({ children }) => (
      <ReactTrackingContext.Provider value={contextValue}>
        {children}
      </ReactTrackingContext.Provider>
    ),
    [contextValue]
  );

  return useMemo(() => [TrackingProvider, tracking], [
    TrackingProvider,
    tracking,
  ]);
}
