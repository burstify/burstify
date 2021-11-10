import { Blueprint, State, Transition } from './Workflow'

export declare type TransitionContext = {
  input: State
  transition: Transition<any>
  blueprint: Blueprint
}

export declare type Policy = (context: TransitionContext) => boolean

export declare type Executor = (
  node: string,
  payload: any,
  context: TransitionContext
) => Promise<void>

export declare type EngineOptions = {
  policies: {
    [policyName: string]: Policy
  }
  executor: Executor
}

export const NoopExecutor: Executor = async () => {}

export const DEFAULT_ENGINE_OPTIONS: EngineOptions = {
  policies: {},
  executor: NoopExecutor
}
