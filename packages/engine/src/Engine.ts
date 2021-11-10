import { Blueprint, NodeStatus, State, Transition } from './Workflow'
import {
  DEFAULT_ENGINE_OPTIONS,
  EngineOptions,
  TransitionContext
} from './EngineOptions'

export class TransitionPolicyViolated extends Error {
  constructor(public readonly policies: string[]) {
    super(
      `E_TRANSITION_POLICY:(${policies.join()}):Transition ${
        policies.length > 1 ? 'policies' : 'policy'
      } [${policies.join(', ')}] was violated`
    )
  }
}

export default class Engine {
  private readonly options: EngineOptions
  constructor(
    private readonly blueprint: Blueprint,
    options: Partial<EngineOptions> = {}
  ) {
    this.options = { ...DEFAULT_ENGINE_OPTIONS, ...options }
  }

  private getDefaultState(blueprint: Blueprint): State {
    return {
      payloads: [],
      nodes: blueprint.nodes.map(({ name }) => ({
        name,
        status: NodeStatus.INACTIVATED
      }))
    }
  }

  async transit(context: TransitionContext): Promise<State> {
    const { input, transition, blueprint } = context
    const { transitionPolicies, endingPolicies, executor } = this.options

    // TODO transition policy
    const violatedPolicies: string[] = Object.entries(transitionPolicies)
      .map(([policyName, policy]) => {
        const pass = policy(context)
        return {
          policy: policyName,
          pass
        }
      })
      .reduce((violatedPolicies: string[], { policy, pass }) => {
        return pass ? violatedPolicies : [...violatedPolicies, policy]
      }, [])

    if (violatedPolicies.length) {
      throw new TransitionPolicyViolated(violatedPolicies)
    }

    // TODO execute
    const output: State = {
      payloads: [...input.payloads, transition.payload],
      nodes: [...input.nodes]
    }

    // TODO ending policy
    const shouldEnd = {}

    return output
  }
}
