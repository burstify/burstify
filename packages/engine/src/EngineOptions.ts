import { Blueprint, State, Transition } from './Workflow'

export declare type TransitionContext = {
  input: State
  transition: Transition<any>
  blueprint: Blueprint
}

export declare type TransitionPolicy = (context: TransitionContext) => boolean

export declare type EndingPolicy = (output: State) => boolean

export declare type Executor = (
  context: TransitionContext
) => void | Promise<void>

export declare type EngineOptions = {
  endingPolicies: {
    [policyName: string]: EndingPolicy
  }
  transitionPolicies: {
    [policyName: string]: TransitionPolicy
  }
  executor: Executor
}

export const NoopExecutor: Executor = () => {}

export const DEFAULT_ENGINE_OPTIONS: EngineOptions = {
  endingPolicies: {},
  transitionPolicies: {},
  executor: NoopExecutor
}
