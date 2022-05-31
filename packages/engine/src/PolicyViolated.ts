export default class PolicyViolated extends Error {
  constructor(public readonly policies: string[]) {
    super(
      `E_TRANSITION_POLICY:(${policies.join()}):Transition ${
        policies.length > 1 ? 'policies' : 'policy'
      } [${policies.join(', ')}] was violated`
    )
  }
}
