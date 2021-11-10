import * as yargs from 'yargs'

import StartCommand from './commands/start'

yargs.command(StartCommand).strictCommands().demandCommand(1).argv
