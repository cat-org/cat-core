import { Cli, Command } from 'clipanion';

import pluginConfiguration from './pluginConfiguration';

export const mockStdout = {
  write: jest.fn(),
};

class TestingCli extends Cli {
  run = (args, options) =>
    super.run(args, {
      ...Cli.defaultContext,
      plugins: pluginConfiguration,
      cwd: process.cwd(),
      stdout: mockStdout,
      ...options,
    });
}

export default (commandOrCommands, mockCommands = []) => {
  const cli = new TestingCli();
  const commands =
    commandOrCommands instanceof Array
      ? commandOrCommands
      : [commandOrCommands];

  commands.forEach(command => {
    cli.register(command);
  });
  mockCommands.forEach(mockCommand => {
    cli.register(
      class MockCommand extends Command {
        @Command.Path(...mockCommand)
        execute = jest.fn();
      },
    );
  });

  return cli;
};