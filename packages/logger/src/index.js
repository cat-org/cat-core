// @flow

import React from 'react';
import { render } from 'ink';

import Logger, { type propsType } from './components';

type logsType = $PropertyType<propsType, 'logs'>;
type eventType = $PropertyType<
  $ElementType<$ElementType<logsType, string>, number>,
  'event',
>;

export const cache: {|
  logs: logsType,
  render: typeof render,
  add: (name: string, event: eventType, message: string) => void,
  instance?: $Call<typeof render>,
|} = {
  logs: {},
  render,

  /**
   * @param {string} name - logger name
   * @param {eventType} event - log event
   * @param {string} message - log message
   */
  add: (name: string, event: eventType, message: string) => {
    cache.logs = {
      ...cache.logs,
      [name]: [...(cache.logs[name] || []), { event, message }],
    };

    if (cache.instance) cache.instance.rerender(<Logger logs={cache.logs} />);
    else cache.instance = cache.render(<Logger logs={cache.logs} />);
  },
};

/**
 * @param {string} name - logger name
 *
 * @return {object} - logger
 */
export default (
  name: string,
): ({|
  [eventType]: (message: string) => void,
|}) => ({
  /**
   * @param {string} message - log success message
   */
  success: (message: string) => {
    cache.add(name, 'success', message);
  },

  /**
   * @param {string} message - log error message
   */
  error: (message: string) => {
    cache.add(name, 'error', message);
  },

  /**
   * @param {string} message - log info message
   */
  info: (message: string) => {
    cache.add(name, 'info', message);
  },

  /**
   * @param {string} message - log warn message
   */
  warn: (message: string) => {
    cache.add(name, 'warn', message);
  },

  /**
   * @param {string} message - log message
   */
  log: (message: string) => {
    cache.add(name, 'log', message);
  },
});