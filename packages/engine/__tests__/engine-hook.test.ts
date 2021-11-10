import Engine, { TransitionPolicyViolated } from '../src/Engine'
import { Blueprint, State, Transition } from '../src/Workflow'

describe('Engine test suite', () => {
  const transition: Transition<any> = { activate: [] }

  const blueprint: Blueprint = {
    nodes: [],
    graphs: []
  }

  const input: State = {
    nodes: [],
    payloads: []
  }

  const assumingContext = {
    blueprint,
    input,
    transition
  }

  test('Engine triggering transition policy', async () => {
    const policySpy = jest.fn()

    policySpy.mockReturnValue(true)

    const engine = new Engine(blueprint, {
      transitionPolicies: {
        foo: policySpy
      }
    })

    await engine.transit(assumingContext)

    expect(policySpy).toBeCalledWith(assumingContext)
  })

  test('Engine will throw error when policies was violated', async () => {
    const policySpy = jest.fn()

    policySpy.mockReturnValue(false)

    const engine = new Engine(blueprint, {
      transitionPolicies: {
        foo: policySpy,
        bar: policySpy
      }
    })

    await expect(engine.transit(assumingContext)).rejects.toThrow(
      'E_TRANSITION_POLICY:(foo,bar)'
    )
    expect(policySpy).toBeCalledWith(assumingContext)
  })
})
