import Engine from '../src/Engine'
import { Hook } from '../src/EngineOptions'
import { Blueprint, State, Transition } from '../src/Workflow'

describe('Engine hooks test suite', () => {
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

  test('Engine triggering transition hooks', async () => {
    const spyHook: Hook = {
      transiting: jest.fn(),
      transited: jest.fn(),
      finish: jest.fn()
    }

    const engine = new Engine(blueprint, {
      hooks: [spyHook]
    })

    const output = await engine.run(transition)

    expect(spyHook.transiting).toBeCalledTimes(1)
    expect(spyHook.transiting).toBeCalledWith(assumingContext)

    expect(spyHook.transited).toBeCalledTimes(1)
    expect(spyHook.transited).toBeCalledWith(assumingContext, output)
  })

  describe('Engine triggering validation hook', () => {
    const validationHook: Hook = {
      invalid: jest.fn(),
      valid: jest.fn()
    }

    test('Valid hook', async () => {
      const engine = new Engine(blueprint, {
        hooks: [validationHook]
      })

      await engine.run(transition)

      expect(validationHook.valid).toBeCalledTimes(1)
      expect(validationHook.valid).toBeCalledWith(assumingContext)
    })

    test('Invalid hook', async () => {
      const engine = new Engine(blueprint, {
        hooks: [validationHook],
        transitionPolicies: {
          alwaysFail1: () => false,
          alwaysFail2: () => false
        }
      })

      await expect(engine.run(transition)).rejects.toThrow(
        'Transition policies were violated [alwaysFail1, alwaysFail2]'
      )

      expect(validationHook.invalid).toBeCalledTimes(1)
      expect(validationHook.invalid).toBeCalledWith(assumingContext, [
        'alwaysFail1',
        'alwaysFail2'
      ])
    })
  })

  describe('Engine triggering finish hook', () => {
    test('Finish hook has been triggered if first policy was matched', async () => {
      const endingHook: Hook = {
        finish: jest.fn()
      }
      const engine = new Engine(blueprint, {
        hooks: [endingHook],
        endingPolicies: {
          endingFirst: () => true
        }
      })

      await engine.run(transition)

      expect(endingHook.finish).toBeCalledTimes(1)
      expect(endingHook.finish).toBeCalledWith(assumingContext, 'endingFirst')
    })
  })
})
