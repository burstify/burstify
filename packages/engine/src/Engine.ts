import { Blueprint, NodeStatus, State, Transition } from './Workflow'
import {
  DEFAULT_ENGINE_OPTIONS,
  EngineOptions,
  TransitionContext
} from './EngineOptions'
import PolicyViolated from './PolicyViolated'
import { Observable } from 'rxjs'

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

  private checkForPolicies(context: TransitionContext) {
    const { policies } = this.options

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
      throw new PolicyViolated(violatedPolicies)
    }
  }

  public transit(
    transition: Transition<any>,
    input = this.getDefaultState(this.blueprint)
  ): Observable<State> {
    const context: TransitionContext = {
      blueprint: this.blueprint,
      transition,
      input
    }

    this.checkForPolicies(context)

    const { executor } = this.options

    return new Observable<State>((subscriber) => {
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

      subscriber.next(activatedState)

      Promise.all(
        Object.entries(transition).map(([node, payload]) => {
          return executor(node, payload, context)
            .then(() => {
              subscriber.next({
                ...activatedState,
                [node]: {
                  status: activatedState[node].status,
                  payload: [...activatedState[node].payload, payload]
                }
              })
            })
            .catch((error) => {
              subscriber.error(error)
            })
        })
      ).then(() => {
        subscriber.complete()
      })
    })
  }
}
