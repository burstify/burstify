import { Blueprint, NodeStatus, State, Transition } from './Workflow'
import {
  DEFAULT_ENGINE_OPTIONS,
  EngineOptions,
  TransitionContext
} from './EngineOptions'

declare type TransitionParameters = {
  blueprint: Blueprint
  transition: Transition<any>
  input?: State
}

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
    return Object.fromEntries(
      Object.keys(blueprint.nodes).map((node) => [
        node,
        {
          status: NodeStatus.INACTIVATED,
          payload: []
        }
      ])
    )
  }

  async transit({
    blueprint,
    transition,
    input = this.getDefaultState(blueprint)
  }: TransitionParameters): Promise<State> {
    const context: TransitionContext = {
      blueprint,
      transition,
      input
    }

    const { policies, executor } = this.options

    const violatedPolicies: string[] = Object.entries(policies)
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

    const activatedState = Object.fromEntries(
      Object.entries(input).map(([name, { status, payload }]) => {
        return [
          name,
          {
            payload,
            status: Object.keys(transition).includes(name)
              ? NodeStatus.ACTIVATED
              : status
          }
        ]
      })
    )

    Object.entries(transition).map(([node, payload]) => {
      return executor(node, payload, context)
        .then(() => {})
        .catch((error) => {
          // TODO proceed when activation fail
        })
    })

    return input
  }
}
