import { Blueprint, State, Transition, Engine } from '../src'
import { raw } from '@prisma/client/runtime'

describe('Engine test suite', () => {
  test('Engine can change the node state', async () => {
    const blueprint = {
      nodes: {
        node1: {},
        node2: {}
      },
      graph: []
    }

    const engine = new Engine(blueprint)

    const output = await engine.transit({
      node1: 'payload1'
    })

    console.log(output)
  })

  describe('Engine integrated with policies', () => {
    const transition: Transition<any> = {}

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

    test('Engine trigger policy', () => {
      const policySpy = jest.fn()

      policySpy.mockReturnValue(true)

      const engine = new Engine(blueprint, {
        policies: {
          foo: policySpy,
          bar: policySpy
        }
      })

      engine.transit(transition, input)

      expect(policySpy).toBeCalledWith(assumingContext)
    })

    test('Engine will throw error when policies were violated', async () => {
      const policySpy = jest.fn()

      policySpy.mockReturnValue(false)

      const engine = new Engine(blueprint, {
        policies: {
          foo: policySpy,
          bar: policySpy
        }
      })

      expect(() => engine.transit(transition, input)).toThrow(
        'E_TRANSITION_POLICY:(foo,bar)'
      )
      expect(policySpy).toBeCalledWith(assumingContext)
    })
  })
})
