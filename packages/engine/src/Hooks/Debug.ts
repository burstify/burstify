import { Hook, TransitionContext } from '../EngineOptions'
import { Debugger } from 'debug'

export default class Debug implements Hook {
  constructor(private readonly debug: Debugger) {}
  checking(context: TransitionContext) {
    this.debug('checking before transition %O', context)
  }
  invalid(context: TransitionContext, violatedPolicies: string[]) {
    this.debug('transition violated policies %O %O', violatedPolicies, context)
  }
}
