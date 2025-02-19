# rsql-query-builder

Library for building RSQL query strings in TypeScript and JavaScript.

[![NPM Version][npm-version-image]][npm-url]
[![NPM License][npm-license-image]][npm-url]
[![Coverage][coveralls-image]][coveralls-url]

## Installation

```bash
$ npm install rsql-query-builder
```

## Using the RSQL Builder

```typescript
/* Long Version */
const builder = new RSQLBuilder().equal('name', 'Filip').and().greaterThan('age', 30);
const rsqlString = builder.toString();
console.log(rsqlString);
// Output: name=="Filip";age=gt=30

/* Short Version */
console.log(new RSQLBuilder().equal('name', 'Filip').and().greaterThan('age', 30).toString());
// Output: name=="Filip";age=gt=30
```

## RSQL Builder Methods

The `RSQLBuilder` class provides many methods to build the desired RSQL string.

### Initialization

`constructor()` – Initializes a new RSQLBuilder instance.

### Comparisons Operators (Defining Conditions)

`equal(selector, value)` - Appends a condition `selector == value`.
`notEqual(selector, value)` - Appends a condition `selector != value`.
`lessThan(selector, value)` - Appends a condition `selector =lt= value`.
`lessThanOrEqual(selector, value)` - Appends a condition `selector =le= value`.
`greaterThan(selector, value)` - Appends a condition `selector =gr= value`.
`greaterThanOrEqual(selector, value)` - Appends a condition `selector =ge= value`.
`in(selector, values)` - Appends a condition `selector =in= (values)`.
`notIn(selector, value)` - Appends a condition `selector =out= (values)`.

### Expression Grouping (Organizing Conditions)

`group(builder)` - Wraps the conditions from another RSQLBuilder instance in parentheses for grouping.

### Logical Operators (Combining Conditions)

`and()` – Appends the logical **AND** operator `;`.
`or()` - Appends a logical **OR** operator `,`.

### RSQL Builder Composition (Combining Multiple RSQL Queries)

`concat(builder)` – Appends all expressions from another RSQLBuilder instance to the current instance.
`merge(builders)` – Merges multiple RSQLBuilder instances into grouped conditions.

### RSQL String Management (Finalizing the Query)

`toString()` - Returns the generated RSQL query string.
`isEmpty()` – Returns true if the RSQLBuilder instance has no expressions; otherwise, returns false.
`reset()` – Clears all expressions, resetting the RSQLBuilder instance.

### Static Utilities

`merge(builders)` – Creates a new RSQLBuilder instance and merges multiple RSQLBuilder instances into grouped conditions.

## Extending the RSQL Query Builder

You can extend the RSQL Builder to customize it for your needs.

This is a sample extension:

```typescript
import RSQLBuilderBase, { RSQLBuilderOptions } from './RSQLBuilderBase';

type ComparisonOperators = 'like' | 'notLike';

/** RSQL builder class
 *
 * This class is used to build RSQL queries.
 *
 * @template TSelector - The type of the selector. It is used to define the field names and is a list of strings.
 */
class RSQLBuilderSample<TSelector extends string = string> extends RSQLBuilderBase<TSelector, ComparisonOperators> {
    /** Create a new RSQL builder.
     *
     * @param options - The builder options
     *
     * @returns The builder instance
     * */
    constructor(options: RSQLBuilderOptions<ComparisonOperators> = {}) {
        super({ ...options, customComparisonOperators: { like: { rsql: '=like=' }, notLike: { rsql: '=notlike=' } } });
    }

    /** Add a like comparison to the query.
     *
     * @param selector - The field name
     * @param value - The value to compare
     *
     * @returns The builder instance
     */
    like(selector: TSelector, value: string | number | Date | null): this {
        return this.addComparison(selector, 'like', value);
    }

    /** Add a not like comparison to the query.
     *
     * @param selector - The field name
     * @param value - The value to compare
     *
     * @returns The builder instance
     */
    notLike(selector: TSelector, value: string | number | Date | null): this {
        return this.addComparison(selector, 'like', value);
    }
}

// Usage example of sample RSQLBuilder class
console.log(new RSQLBuilderSample().like('name', 'Fil').and().notLike('city', 'Yor').toString());
// Output: name=like="Fil";city=notlike="Yor"

export default RSQLBuilderSample;
```

## License

[MIT](LICENSE)

[npm-version-image]: https://img.shields.io/npm/v/rsql-query-builder
[npm-url]: https://npmjs.org/package/rsql-query-builder
[npm-license-image]: https://img.shields.io/npm/l/rsql-query-builder
[coveralls-image]: https://coveralls.io/repos/github/woigl/rsql-query-builder/badge.svg?branch=main
[coveralls-url]: https://coveralls.io/github/woigl/rsql-query-builder?branch=main
