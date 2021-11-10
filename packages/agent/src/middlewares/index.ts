import { PrismaClient } from '@prisma/client'
import { MiddlewareFunction } from 'yargs'

export type PrismaContext = {
  prisma: PrismaClient
}

export const usePrisma: MiddlewareFunction = () => {
  return {
    prisma: new PrismaClient()
  }
}
