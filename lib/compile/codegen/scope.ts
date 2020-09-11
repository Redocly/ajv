import {_, nil, Code, Name} from "./code"

interface NameGroup {
  prefix: string
  index: number
}

export interface NameValue {
  ref: ValueReference // this is the reference to any value that can be referred to from generated code via `globals` var in the closure
  key?: unknown // any key to identify a global to avoid duplicates, if not passed ref is used
  code?: Code // this is the code creating the value needed for standalone code wit_out closure - can be a primitive value, function or import (`require`)
}

export type ValueReference = unknown // possibly make CodeGen parameterized type on this type

class ValueError extends Error {
  value?: NameValue
  constructor(name: ValueScopeName) {
    super(`CodeGen: "code" for ${name} not defined`)
    this.value = name.value
  }
}

interface ScopeOptions {
  prefixes?: Set<string>
  parent?: Scope
}

interface ValueScopeOptions extends ScopeOptions {
  scope: ScopeStore
}

export type ScopeStore = Record<string, ValueReference[]>

type ScopeValues = {[prefix: string]: Map<unknown, ValueScopeName>}

export type ScopeValueSets = {[prefix: string]: Set<ValueScopeName>}

export class Scope {
  _names: {[prefix: string]: NameGroup} = {}
  _prefixes?: Set<string>
  _parent?: Scope

  constructor({prefixes, parent}: ScopeOptions = {}) {
    this._prefixes = prefixes
    this._parent = parent
  }

  toName(nameOrPrefix: Name | string): Name {
    return nameOrPrefix instanceof Name ? nameOrPrefix : this.name(nameOrPrefix)
  }

  name(prefix: string): Name {
    return new Name(newName.call(this, prefix))
  }
}

interface ScopePath {
  property: string
  itemIndex: number
}

export class ValueScopeName extends Name {
  prefix: string
  value?: NameValue
  scopePath?: Code

  constructor(prefix: string, nameStr: string) {
    super(nameStr)
    this.prefix = prefix
  }

  setValue(value: NameValue, {property, itemIndex}: ScopePath) {
    this.value = value
    this.scopePath = _`.${new Name(property)}[${itemIndex}]`
  }
}

export class ValueScope extends Scope {
  _values: ScopeValues = {}
  _scope: ScopeStore

  constructor(opts: ValueScopeOptions) {
    super(opts)
    this._scope = opts.scope
  }

  get() {
    return this._scope
  }

  name(prefix: string): ValueScopeName {
    return new ValueScopeName(prefix, newName.call(this, prefix))
  }

  value(nameOrPrefix: ValueScopeName | string, value: NameValue): ValueScopeName {
    if (value.ref === undefined) throw new Error("CodeGen: ref must be passed in value")
    const name = this.toName(nameOrPrefix) as ValueScopeName
    const prefix = name.prefix
    const valueKey = value.key ?? value.ref
    let vs = this._values[prefix]
    if (vs) {
      const _name = vs.get(valueKey)
      if (_name) return _name
    } else {
      vs = this._values[prefix] = new Map()
    }
    vs.set(valueKey, name)

    const s = this._scope[prefix] || (this._scope[prefix] = [])
    const itemIndex = s.length
    s[itemIndex] = value.ref
    name.setValue(value, {property: prefix, itemIndex})
    return name
  }

  getValue(prefix: string, keyOrRef: unknown): ValueScopeName | void {
    const vs = this._values[prefix]
    if (!vs) return
    return vs.get(keyOrRef)
  }

  scopeRefs(scopeName: Name, values?: ScopeValues | ScopeValueSets): Code {
    return reduceValues.call(this, values, (name: ValueScopeName) => {
      if (name.scopePath === undefined) throw new Error(`CodeGen: name "${name}" has no value`)
      return _`${scopeName}${name.scopePath}`
    })
  }

  scopeCode(values?: ScopeValues | ScopeValueSets): Code {
    return reduceValues.call(this, values, (name: ValueScopeName) => {
      const c = name.value?.code
      if (c) return c
      throw new ValueError(name)
    })
  }
}

function newName(this: Scope | ValueScope, prefix: string): string {
  let ng = this._names[prefix]
  if (!ng) {
    if (this._parent?._prefixes?.has(prefix) || (this._prefixes && !this._prefixes?.has(prefix))) {
      throw new Error(`CodeGen: prefix "${prefix}" is not allowed in this scope`)
    }
    ng = this._names[prefix] = {prefix, index: 0}
  }
  return prefix + ng.index++
}

function reduceValues(
  this: ValueScope,
  values: ScopeValues | ScopeValueSets = this._values,
  valueCode: (n: ValueScopeName) => Code
): Code {
  let code: Code = nil
  for (const prefix in values) {
    values[prefix].forEach((name: ValueScopeName) => {
      code = _`${code}const ${name} = ${valueCode(name)};`
    })
  }
  return code
}
