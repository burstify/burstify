import { Blueprint, State, Transition, Engine } from '../src'

describe('Engine test suite', () => {
  const transition: Transition<any> = { activate: [] }

  const blueprint: Blueprint = {
    nodes: {},
    graph: []
  }

  const input: State = {}

  const assumingContext = {
    blueprint,
    input,
    transition
  }

  test('Engine triggering transition policy', async () => {
    const policySpy = jest.fn()

    policySpy.mockReturnValue(true)

    const engine = new Engine(blueprint, {
      policies: {
        foo: policySpy,
        bar: policySpy
      }
    })

    await engine.transit(assumingContext)

    expect(policySpy).toBeCalledWith(assumingContext)
  })

  test('Engine will throw error when policies was violated', async () => {
    const policySpy = jest.fn()

    policySpy.mockReturnValue(false)

    const engine = new Engine(blueprint, {
      policies: {
        foo: policySpy,
        bar: policySpy
      }
    })

    await expect(engine.transit(assumingContext)).rejects.toThrow(
      'E_TRANSITION_POLICY:(foo,bar)'
    )
    expect(policySpy).toBeCalledWith(assumingContext)
  })

  test('Engine can change the node state', () => {
    const engine = new Engine({
      nodes: {
        node1: {},
        node2: {}
      },
      graph: []
    })
  })
})
