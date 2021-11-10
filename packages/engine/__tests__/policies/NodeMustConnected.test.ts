import { NodeMustBeConnected } from '../../src/TransitionPolicies'
import { TransitionContext } from '../../src/EngineOptions'
import { NodeStatus } from '../../src/Workflow'

describe('NodeMustConnected test suite', function () {
  test('should allow if one of previous nodes is activated', () => {
    const context: TransitionContext = {
      blueprint: {
        nodes: [
          {
            name: 'step1.1'
          },
          {
            name: 'step1.2'
          },
          {
            name: 'step2'
          }
        ],
        graphs: [
          { from: 'step1.1', to: 'step2' },
          { from: 'step1.2', to: 'step2' }
        ]
      },
      transition: {
        activate: []
      },
      input: {
        nodes: [
          { name: 'step1.1', status: NodeStatus.ACTIVATED },
          { name: 'step1.2', status: NodeStatus.INACTIVATED },
          { name: 'step2', status: NodeStatus.INACTIVATED }
        ],
        payloads: []
      }
    }

    expect(NodeMustBeConnected(context)).toEqual(true)
  })

  test('should allow if there are no previous node', () => {
    const context: TransitionContext = {
      blueprint: {
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
      transition: {
        activate: []
      },
      input: {
        nodes: [
          { name: 'step1', status: NodeStatus.INACTIVATED },
          { name: 'step2', status: NodeStatus.INACTIVATED }
        ],
        payloads: []
      }
    }

    expect(NodeMustBeConnected(context)).toEqual(true)
  })

  test('should reject if there are no activated previous node', () => {
    const context: TransitionContext = {
      blueprint: {
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
      transition: {
        activate: ['step2']
      },
      input: {
        nodes: [
          { name: 'step1', status: NodeStatus.INACTIVATED },
          { name: 'step2', status: NodeStatus.INACTIVATED }
        ],
        payloads: []
      }
    }

    expect(NodeMustBeConnected(context)).toEqual(false)
  })
})
