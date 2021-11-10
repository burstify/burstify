import { TransitionPolicy } from '../EngineOptions'
import { NodeStatus } from '../Workflow'

const NodeMustBeConnected: TransitionPolicy = ({
  transition,
  blueprint,
  input
}): boolean => {
  // The result for each requesting nodes
  const resultForEachNodes = transition.activate.map((node) => {
    // With each node we'll do following steps:

    // First we'll find all of the previous nodes
    const previousNodes = blueprint.graphs.reduce(
      (previousNodes: string[], { from, to }) =>
        to === node ? [...previousNodes, from] : previousNodes,
      []
    )

    // If there are no previous nodes, it will pass
    if (!previousNodes.length) {
      return true
    }

    // Second, we'll check if there is any activated previous node

    // if there are, then it should also pass
    // else it should fail
    return !!previousNodes.find((node) =>
      input.nodes.find(
        ({ name: nodeName, status }) =>
          node === nodeName && status === NodeStatus.ACTIVATED
      )
    )
  })

  // The transition will passed if all of the requesting nodes are passed
  return resultForEachNodes.reduce(
    (conclusion, result) => result && conclusion,
    true
  )
}

export default NodeMustBeConnected
