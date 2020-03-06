// @flow

import net from 'net';

import debug from 'debug';

import findMainServer from './findMainServer';

const debugLog = debug('worker:sendToServer');

/**
 * @example
 * sendToServer('{}', () => {})
 *
 * @param {string} data - the data which will be sent to the server
 * @param {Function} callback - callback function
 */
const sendToServer = async (data: string, callback: () => void) => {
  const mainServer = await findMainServer();
  const client = net.connect(parseInt(mainServer?.port || -1, 10));

  client.on('error', (err: Error) => {
    debugLog(err);
    setTimeout(sendToServer, 10, data, callback);
  });

  client.end(data, callback);
};

export default sendToServer;
