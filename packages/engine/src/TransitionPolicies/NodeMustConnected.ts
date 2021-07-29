import { Policy } from '../EngineOptions'

const NodeMustConnected: Policy = ({ transition, blueprint }): boolean => {
  return true
}

export default NodeMustConnected
