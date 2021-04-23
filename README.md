# typist-json

A simple runtime JSON type checker.

# Features

- **Simple**. No JSON Schema, No validation rules
- **Type-safe**. Written in TypeScript
- **Intuitive**. Familiar syntax like TypeScript interface

# Install

```shell
npm install typist-json
```

# Example

```typescript
import { j } from 'typist-json'

const UserJsonType = j.object({
  name: j.string,
  age: j.number,
  'nickname?': j.string, // optional property
})

const userJson = await fetch("/api/user")
    .then(res => res.json)

if (UserJsonType.check(userJson)) {
  // now, the userJson is narrowed to:
  // {
  //   name: string
  //   age: number
  //   nickname?: string | undefined
  // }
}
```

# References

## Checker\<T>

A base interface that all type checkers implement.

### check(value: unknown): value is T

Check whether the `value` is of type `T` or not.

If `check` returns `true` then the `value` is of type `T`
and the `value` is narrowed to `T`.

## j

A container that contains all built-in type checkers.

All built-in type checkers are followings:

### j.string

Checks if the value is string type or not.

```TypeScript
j.string.check("foo") // true, narrowed to `string`
```

### j.number

Checks if the value is number type or not.

```TypeScript
j.number.check(42.195) // true, narrowed to `number`
```

### j.boolean

Checks if the value is boolean type or not.

```TypeScript
j.boolean.check(true) // true, narrowed to `boolean`
```

### j.literal(str: string)

Checks if the value equals `str` or not.

```TypeScript
const json: any = "foo"
j.literal("foo").check(json) // true, narrowed to `"foo"`
j.literal("foo").check("bar") // false
```

### j.unknown

Doesn't check the value type. This won't narrow types.

```TypeScript
j.unknown.check("foo") // true
j.unknown.check({a: 42}) // true
```

### j.nil

Checks if the value is `null` or not.

```TypeScript
j.nil.check(null) // true, narrowed to `null`
```

### j.nullable(checker: Checker)

Checks if the value is `null` or matches the checker.

```TypeScript
j.nullable(string).check(null) // true, narrowed to `string | null`
j.nullable(string).check("foo") // true, narrowed to `string | null`
```

### j.any(checkers: Checker[])

Checks if the value matches any of the checkers.

```TypeScript
const checker = j.any([string, number])
checker.check("foo") // true, narrowed to `string | number`
checker.check(42) // true, narrowed to `string | number`
```

### j.array(checker: Checker)

Checks if the value is an array of elements that match the checker.

```TypeScript
j.array(string).check(["foo", "bar"]) // true, narrowed to `string[]`
```

### j.object(properties: {[key: string]: Checker})

Checks if the value is an object that consists of `properties` and each property matches correspond checkers.

A property name ends with `?` is considered optional.

```TypeScript
const checker = j.object({
  name: j.string,
  age: j.number,
  'nickname?': j.string,
})

// true, narrowed to { name: string, age: number, nickname?: string | undefined }
checker.ckeck({
  name: "John",
  age: 42,
  nickname: "Johnny",
})

// true, because `nickname` is optional.
// narrowed to { name: string, age: number, nickname?: string | undefined }
checker.ckeck({
  name: "Emma",
  age: 20,
})

// false, because `nickname` is optional, not nullable.
// optional properties are distinguished from nullable properties.
checker.check({
  name: "Bob",
  age: 18,
  nickname: null, // invalid
})

// similarly, nullable properties cannot be omitted.
j.object({ foo: j.nullable(j.string) }).check({}) // false, because property named `foo` is required
```

If you want to use property name that ends with `?` as non-optional property, you can escape `?` as `??`.

```TypeScript
const checker = j.object({
  "are_you_sure??": j.boolean,
})

// true, narrowed to { "are_you_sure?": boolean }
checker.check({
  "are_you_sure?": true,
})
```

<details>
<summary>More details about escaping</summary>

As mentioned above, you need to escape all trailing `?` as `??`.

So if you want optional property with a name `"foo???"`,
you should use `"foo???????"` as property name for `j.object` like:

```TypeScript
const checker = j.object({
  "foo???????": j.boolean,
})

// true, narrowed to { "foo???"?: boolean | undefined }
checker.check({
  "foo???": true,
})
```
</details>

## JsonTypeOf\<Checker>

A type alias that represents the type of JSON corresponding to the `Checker`.

```TypeScript
const checker = j.object({
  model: j.string,
  os: j.any([
    j.literal("ios"),
    j.literal("android"),
    j.literal("blackberry")
  ]),
  serial_number: j.string,
})

type SmartPhoneJson = JsonTypeOf<typeof checker>
// SmartPhoneJson will be:
// {
//   model: string
//   os: "ios" | "android" | "blackberry"
//   serial_number: string
// }
```
🙇‍♂️💯
