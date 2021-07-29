import { Blueprint, NodeStatus, State, Transition } from './Workflow'
import {
  DEFAULT_ENGINE_OPTIONS,
  EngineOptions,
  Policy,
  TransitionContext,
  TransitionPolicyViolated
} from './EngineOptions'

type HookMethod = 'invalid' | 'transiting' | 'transited' | 'finish'

export default class Engine {
  private readonly options: EngineOptions
  constructor(
    private readonly blueprint: Blueprint,
    options: Partial<EngineOptions> = {}
  ) {
    this.options = { ...DEFAULT_ENGINE_OPTIONS, ...options }
  }

  private async callHooks(
    method: HookMethod,
    context: TransitionContext,
    extra?: any
  ) {
    for (let i = 0; i < this.options.hooks.length; i++) {
      const hook = this.options.hooks[i]
      if (hook[method]) {
        ;((await hook[method]) as Function).call(hook, context, extra)
      }
    }
  }

  private validate(context: TransitionContext) {
    const { transitionPolicies } = this.options

    const results = Object.entries(transitionPolicies).map(
      ([name, policy]) => [name, policy(context)] as [string, boolean]
    )

    return results.filter(([, result]) => !result)
  }

  private shouldBeFinished(
    context: TransitionContext
  ): [string, Policy] | undefined {
    const { endingPolicies } = this.options

    return Object.entries(endingPolicies).find(([, policy]) => policy(context))
  }

  private getDefaultState(): State {
    return {
      payloads: [],
      nodes: this.blueprint.nodes.map(({ name }) => ({
        name,
        status: NodeStatus.INACTIVATED
      }))
    }
  }

  async run(
    transition: Transition<any>,
    input: State = this.getDefaultState()
  ): Promise<State> {
    const context: TransitionContext = {
      blueprint: this.blueprint,
      input,
      transition
    }

    const invalids = this.validate(context)

    if (invalids.length) {
      const violatedPolicies = invalids.map(([name]) => name)
      await this.callHooks('invalid', context, violatedPolicies)
      throw new TransitionPolicyViolated(violatedPolicies)
    }

    await this.callHooks('transiting', context)

    const output: State = {
      payloads: [...input.payloads, transition.payload],
      nodes: input.nodes.map(({ name }) => {
        return {
          name,
          status: transition.activate.includes(name)
            ? NodeStatus.ACTIVATED
            : NodeStatus.INACTIVATED
        }
      })
    }

    await this.callHooks('transited', context, output)

    const endingPolicy = this.shouldBeFinished(context)

    if (endingPolicy) {
      await this.callHooks('finish', context, endingPolicy[0])
    }

    return output
  }
}
