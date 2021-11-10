import { Engine } from '@burstify/engine'
import { CommandModule } from 'yargs'
import { PrismaContext, usePrisma } from '../middlewares'

const StartModule: CommandModule<any, PrismaContext> = {
  command: 'start',
  builder: (yargs) => {
    return yargs.middleware(usePrisma)
  },
  handler: async ({ prisma }) => {
    const engine = new Engine(
      {
        graphs: [],
        nodes: []
      },
      {}
    )
  }
}

export default StartModule
