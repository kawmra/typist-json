<p align="center">
  <img src="assets/logo.svg" width="200">
</p>

<h1 align="center">Typist JSON</h1>

<p align="center">
  <a href="https://bundlephobia.com/result?p=typist-json">
    <img src="https://badgen.net/bundlephobia/minzip/typist-json" alt="minzipped size">
  </a>
  <img src="https://badgen.net/npm/types/typist-json?icon=typescript" alt="types">
  <a href="LICENSE">
    <img src="https://badgen.net/npm/license/typist-json" alt="license">
  </a>
  <a href="https://github.com/kawmra/typist-json/actions/workflows/ci.yml">
    <img src="https://github.com/kawmra/typist-json/actions/workflows/ci.yml/badge.svg" alt="ci">
  </a>
</p>

<p align="center">
  A simple runtime JSON type checker.
</p>

# Features

- **Simple**. No JSON Schema, No validation rules
- **Type-safe**. Written in TypeScript
- **Intuitive**. Familiar syntax like TypeScript interface

Typist JSON is focused on type checking, so there is no validation rules like range of numbers or length of strings.

# Install

```shell
npm install typist-json
```

**NOTE:** Require TypeScript 4.1 or higher because Typist JSON uses [`Mapped Types`](https://www.typescriptlang.org/docs/handbook/2/mapped-types.html) and [`Template Literal Types`](https://www.typescriptlang.org/docs/handbook/2/template-literal-types.html).

# Example

```typescript
import { j } from "typist-json";

const NameJson = j.object({
  firstname: j.string,
  lastname: j.string,
});

const UserJson = j.object({
  name: NameJson,
  age: j.number,
  "nickname?": j.string, // optional property
});

const userJson = await fetch("/api/user")
    .then(res => res.json());

if (UserJson.check(userJson)) {
  // now, the userJson is narrowed to:
  // {
  //   name: {
  //     firstname: string
  //     lastname: string
  //   }
  //   age: number
  //   nickname?: string | undefined
  // }
}
```

## Circular References

Sometimes JSON structures can form circular references.

Typist JSON can represent circular references by wrapping checkers in the arrow function.

```ts
const FileJson = j.object({
  filename: j.string,
});

const DirJson = j.object({
  dirname: j.string,
  entries: () => j.array(j.any([FileJson, DirJson])), // references itself
});

DirJson.check({
  dirname: "animals",
  entries: [
    {
      dirname: "cat",
      entries: [
        { filename: "american-shorthair.jpg" },
        { filename: "munchkin.jpg" },
        { filename: "persian.jpg" },
      ],
    },
    {
      dirname: "dog",
      entries: [
        { filename: "chihuahua.jpg" },
        { filename: "pug.jpg" },
        { filename: "shepherd.jpg" },
      ],
    },
    { filename: "turtle.jpg" },
    { filename: "shark.jpg" },
  ],
}); // true
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

If a property that ends with `?` is not optional, you should replace all trailing `?` by `??`.

<details>
<summary>More details about escaping</summary>

As mentioned above, you need to escape all trailing `?` as `??`.

```ts
j.object({
    "foo??": j.boolean,
}).check({
    "foo?": true,
}); // true
```

So if you want optional property with a name `"foo???"`,
you should use `"foo???????"` as key.

```ts
j.object({
  "foo???????": j.boolean,
}).check({}); // true, since "foo???" is optional
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
j.any([j.string, j.boolean]).check(false); // true

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
