# typist-json

A simple type-safe JSON validator.

- **Simple**: No JSON Schema required
- **Type-safe**: Written in TypeScript
- **Intuitive**: Familiar syntax like TypeScript interface

# Install

```shell
npm install typist-json
```

# Example

```typescript
import { j } from 'typist-json'

const UserJsonValidator = j.object({
  name: j.string,
  age: j.number,
  'nickname?': j.string, // optional property
})

const userJson = await fetch("/api/user")
    .then(res => res.json)

if (UserJsonValidator.validate(userJson)) {
  // now, the userJson is narrowed to:
  // {
  //   name: string
  //   age: number
  //   nickname?: string | undefined
  // }
}
```

# References

## Validator\<T>

A base interface that all validators implement.

### validate(value: unknown): value is T

Validate whether the `value` is valid as `T` or not.

If `validate` returns `true` then the `value` is valid as `T`
and the `value` is narrowed to `T`.

## j

A container that contains all built-in validators.

All built-in validators are followings:

### j.string

A validator that validates whether the value is `string` or not.

```TypeScript
j.string.validate("foo") // true, narrowed to `string`
```

### j.number

A validator that validates whether the value is `number` or not.

```TypeScript
j.number.validate(42.195) // true, narrowed to `number`
```

### j.boolean

A validator that validates whether the value is `boolean` or not.

```TypeScript
j.boolean.validate(true) // true, narrowed to `boolean`
```

### j.literal(str: string)

A validator that validates whether the value is the same as `str` or not.

```TypeScript
const json: any = "foo"
j.literal("foo").validate(json) // true, narrowed to `"foo"`
j.literal("foo").validate("bar") // false
```

### j.unknown

A validator that does not validate values.

This validator doesn't narrow type of the given value.

```TypeScript
j.unknown.validate("foo") // true
j.unknown.validate({a: 42}) // true
```

### j.nil

A validator that validates whether the value is `null` or not.

```TypeScript
j.nil.validate(null) // true, narrowed to `null`
```

### j.nullable(validator: Validator)

A validator that validates whether the value is `null` or valid as given `validator`.

```TypeScript
j.nullable(string).validate(null) // true, narrowed to `string | null`
j.nullable(string).validate("foo") // true, narrowed to `string | null`
```

### j.any(validators: Validator[])

A validator that validates whether the value is valid as any of `validators`.

```TypeScript
const validator = j.any([string, number])
validator.validate("foo") // true, narrowed to `string | number`
validator.validate(42) // true, narrowed to `string | number`
```

### j.array(validator: Validator)

A validator that validates whether the value is an array of value that valid as `validator`.

```TypeScript
j.array(string).validate(["foo", "bar"]) // true, narrowed to `string[]`
```

### j.object(properties: {[key: string]: Validator})

A validator that validates whether a value is an object composed of `properties`.

A property name ends with `?` is considered optional.

```TypeScript
const validator = j.object({
  name: j.string,
  age: j.number,
  'nickname?': j.string,
})

// true, narrowed to { name: string, age: number, nickname?: string | undefined }
validator.validate({
  name: "John",
  age: 42,
  nickname: "Johnny",
)

// true, because `nickname` is optional.
// narrowed to { name: string, age: number, nickname?: string | undefined }
validator.validate({
  name: "Emma",
  age: 20,
})
```

If you want to use property name that ends with `?` as non-optional property, you can escape `?` as `??`.

```TypeScript
const validator = j.object({
  "are_you_sure??": j.boolean,
})

// true, narrowed to { "are_you_sure?": boolean }
validator.validate({
  "are_you_sure?": true,
})
```

<details>
<summary>More details for escaping</summary>

As mentioned above, you need to escape all trailing `?` as `??`.

So if you want optional property with a name `"foo???"`,
you should use `"foo???????"` as property name for `j.object` like:

```TypeScript
const validator = j.object({
  "foo???????": j.boolean,
})

// true, narrowed to { "foo???"?: boolean | undefined }
validator.validate({
  "foo???": true,
})
```
</details>

## JsonOf\<Validator>

A type alias that represents the type of JSON corresponding to the `Validator`.

```TypeScript
const validator = j.object({
  model: j.string,
  os: j.any([
    j.literal("ios"),
    j.literal("android"),
    j.literal("blackberry")
  ]),
  serial_number: j.string,
})

type SmartPhoneJson = JsonOf<typeof validator>
// SmartPhone will be:
// {
//   model: string
//   os: "ios" | "android" | "blackberry"
//   serial_number: string
// }
```
