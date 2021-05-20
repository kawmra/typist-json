# typist-json

A simple runtime JSON type checker.

# Features

- **Simple**. No JSON Schema, No validation rules
- **Type-safe**. Written in TypeScript
- **Intuitive**. Familiar syntax like TypeScript interface

typist-json is focused on type checking, so there is no validation rules like range of numbers or length of strings.

# Install

```shell
npm install typist-json
```

# Example

```typescript
import { j } from "typist-json";

const UserJson = j.object({
  name: j.string,
  age: j.number,
  "nickname?": j.string, // optional property
});

const userJson = await fetch("/api/user")
    .then(res => res.json);

if (UserJson.check(userJson)) {
  // now, the userJson is narrowed to:
  // {
  //   name: string
  //   age: number
  //   nickname?: string | undefined
  // }
}
```

# Type checkers

## Strings

```ts
j.string.check("foo"); // true
j.string.check("bar"); // true
```

## Numbers

```ts
j.number.check(42); // true
j.number.check(12.3); // true
j.number.check("100"); // false
```

## Booleans

```ts
j.boolean.check(true); // true
j.boolean.check(false); // true
```

## Literals

```ts
j.literal("foo").check("foo"); // true
j.literal("foo").check("fooooo"); // false
```

## Arrays

```ts
j.array(j.string).check(["foo", "bar"]); // true
j.array(j.string).check(["foo", 42]); // false
j.array(j.string).check([]); // true
j.array(j.number).check([]); // true
```

## Objects

```ts
j.object({
  name: j.string,
  age: j.number,
  "nickname?": j.string,
}).check({
  name: "John",
  age: 20,
  nickname: "Johnny",
}); // true

j.object({
  name: j.string,
  age: j.number,
  "nickname?": j.string,
}).check({
  name: "Emma",
  age: 20,
}); // true, since "nickname" is optional

j.object({
  name: j.string,
  age: j.number,
  "nickname?": j.string,
}).check({
  id: "xxxx",
  type: "android",
}); // false, since "name" and "age" is required
```

If you want to use property name that ends with `?` as non-optional property, you can escape `?` as `??`.

<details>
<summary>More details about escaping</summary>

As mentioned above, you need to escape all trailing `?` as `??`.

So if you want optional property with a name `"foo???"`,
you should use `"foo???????"` as key like:

```ts
const checker = j.object({
  "foo???????": j.boolean,
})

// true, narrowed to { "foo???"?: boolean | undefined }
checker.check({
  "foo???": true,
})
```
</details>

## Nulls

```ts
j.nil.check(null); // true
j.nil.check(undefined); // false
```

## Nullables

```ts
j.nullable(j.string).check("foo"); // true
j.nullable(j.string).check(null); // true
j.nullable(j.string).check(undefined); // false
```

## Unknowns

```ts
j.unknown.check("foo"); // true
j.unknown.check(123); // true
j.unknown.check(null); // true
j.unknown.check(undefined); // true
j.unknown.check([{}, 123, false, "foo"]); // true
```

## Unions

```ts
j.any([j.string, j.boolean]).check("foo"); // true

j.any([
  j.literal("foo"),
  j.literal("bar"),
]).check("foo"); // true
```

# Get JSON type of checkers

```ts
import { j, JsonTypeOf } from "typist-json";

const UserJson = j.object({
  name: j.string,
  age: j.number,
  "nickname?": j.string,
});

type UserJsonType = JsonTypeOf<typeof UserJson>;
// 
// ^ This is same as:
// 
// type UserJsonType = {
//   name: string;
//   age: number;
//   nickname?: string;
// }
```
