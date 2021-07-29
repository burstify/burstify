import { Blueprint, State, Transition } from './Workflow'

export declare type TransitionContext = {
  input: State
  transition: Transition<any>
  blueprint: Blueprint
}

export declare type Policy = (context: TransitionContext) => boolean

export declare type Hook = {
  invalid?(
    context: TransitionContext,
    violatedPolicies: string[]
  ): void | Promise<void>

  transiting?(context: TransitionContext): void | Promise<void>

  transited?(context: TransitionContext, output: State): void | Promise<void>

  finish?(context: TransitionContext, byPolicy: string): void | Promise<void>

  valid?(context: TransitionContext): void | Promise<void>
}

export declare type EngineOptions = {
  endingPolicies: {
    [policyName: string]: Policy
  }
  transitionPolicies: {
    [policyName: string]: Policy
  }
  hooks: Hook[]
}

export class TransitionPolicyViolated extends Error {
  constructor(public readonly policies: string[]) {
    super(`Transition policies were violated [${policies.join(', ')}]`)
  }
}

export const DEFAULT_ENGINE_OPTIONS: EngineOptions = {
  endingPolicies: {},
  transitionPolicies: {},
  hooks: []
}
