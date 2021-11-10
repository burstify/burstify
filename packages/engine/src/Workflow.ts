export declare type Blueprint = {
  nodes: {
    [node: string]: Record<string, any>
  }
  graph: Connection[]
}

export enum NodeStatus {
  ACTIVATED = 'ACTIVATED',
  INACTIVATED = 'INACTIVATED'
}

export declare type NodeState = {
  status: NodeStatus
  payload: any[]
}

export declare type State = {
  [node: string]: NodeState
}

export declare type Transition<Payload> = {
  [node: string]: Payload
}

export declare type Connection = {
  from: string
  to: string
}
