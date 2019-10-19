/* eslint-disable react/jsx-props-no-spreading */
import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import hoistNonReactStatic from 'hoist-non-react-statics';

import ReactTrackingContext from './ReactTrackingContext';
import useTrackingImpl from './useTrackingImpl';

export const TrackingContextType = PropTypes.shape({
  data: PropTypes.object,
  dispatch: PropTypes.func,
  process: PropTypes.func,
});

export default function withTrackingComponentDecorator(
  trackingData = {},
  options
) {
  return DecoratedComponent => {
    const decoratedComponentName =
      DecoratedComponent.displayName || DecoratedComponent.name || 'Component';

    function WithTracking(props) {
      const { contextValue, tracking } = useTrackingImpl(
        trackingData,
        options,
        props
      );

      return useMemo(
        () => (
          <ReactTrackingContext.Provider value={contextValue}>
            <DecoratedComponent {...props} tracking={tracking} />
          </ReactTrackingContext.Provider>
        ),
        [contextValue, tracking]
      );
    }

    WithTracking.displayName = `WithTracking(${decoratedComponentName})`;

    hoistNonReactStatic(WithTracking, DecoratedComponent);

    return WithTracking;
  };
}
