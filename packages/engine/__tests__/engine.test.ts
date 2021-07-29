import Engine from '../src/Engine'
import { NodeMustConnected } from '../src/TransitionPolicies'
import { NodeStatus, State } from '../src/Workflow'

const engine = new Engine(
  {
    nodes: [
      {
        name: 'step1'
      },
      {
        name: 'step2'
      }
    ],
    graphs: [{ from: 'step1', to: 'step2' }]
  },
  {
    transitionPolicies: {
      connected: NodeMustConnected
    }
  }
)

describe('Engine test suite', () => {
  test('Engine transition with default state', async () => {
    const output = await engine.run({
      activate: ['step1'],
      payload: 'payload'
    })

    expect(output).toEqual({
      payloads: ['payload'],
      nodes: [
        { name: 'step1', status: NodeStatus.ACTIVATED },
        { name: 'step2', status: NodeStatus.INACTIVATED }
      ]
    })
  })

  test('Engine transition with a given input state', async () => {
    const input: State = {
      nodes: [
        { name: 'step1', status: NodeStatus.ACTIVATED },
        { name: 'step2', status: NodeStatus.INACTIVATED }
      ],
      payloads: ['payload1']
    }

    const output = await engine.run(
      {
        activate: ['step2'],
        payload: 'payload2'
      },
      input
    )

    expect(output).toEqual({
      payloads: ['payload1', 'payload2'],
      nodes: [
        { name: 'step1', status: NodeStatus.INACTIVATED },
        { name: 'step2', status: NodeStatus.ACTIVATED }
      ]
    })
  })
})
