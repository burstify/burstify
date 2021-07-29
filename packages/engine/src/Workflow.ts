export declare type Node<Attributes> = {
  name: string
  attributes?: Attributes
}

export declare type Blueprint = {
  nodes: Node<any>[]
  graphs: Graph[]
}

export enum NodeStatus {
  ACTIVATED = 'ACTIVATED',
  INACTIVATED = 'INACTIVATED'
}

export declare type NodeState = {
  name: string
  status: NodeStatus
}

export declare type State = {
  payloads: any[]
  nodes: NodeState[]
}

export declare type Transition<Payload> = {
  activate: string[]
  payload?: Payload
}

export declare type Graph = {
  from: string
  to: string
}
