// Reference https://www.npmjs.com/package/rsql-mongodb

import RSQLBuilderBase, { RSQLBuilderOptions } from "./RSQLBuilderBase";


type ComparisonOperator = 'regex' | 'notRegex' | 'exists';

/** RSQL Query Builder for MongoDB.
 *
 * @template Selector - The type of the selector. It is used to define the field names and is a list of strings.
 */
class RSQLBuilderMongoDb<TSelector extends string> extends RSQLBuilderBase<TSelector, ComparisonOperator> {
    constructor(
        options: RSQLBuilderOptions<ComparisonOperator> = {
            customComparisonOperators: {
                regex: '=regex=',
                notRegex: '=notregex=',
                exists: '=exists='
            }
        }
    ) {
        super(options);
    }

    /** Add a REGEX condition.
     *
     * @param field - The field name
     * @param regex - The regex pattern
     * @param options - The regex options
     * @returns The builder instance
     *
     * @see https://www.mongodb.com/docs/manual/reference/operator/query/regex/
     */
    public regex(field: TSelector, regex: string, options?: string): RSQLBuilderMongoDb<TSelector> {
        super.addComparison(field, 'regex', regex);
        return this;
    }

        /** Add a NOT REGEX condition.
     *
     * @param field - The field name
     * @param regex - The regex pattern
     * @param options - The regex options
     * @returns The builder instance
     *
     * @see https://www.mongodb.com/docs/manual/reference/operator/query/regex/
     */
    public notRegex(field: TSelector, regex: string, options?: string): RSQLBuilderMongoDb<TSelector> {
        super.addComparison(field, 'notRegex', regex);
        return this;
    }

    /** Add a LIKE condition.
     *
     * @param field - The field name
     * @param regex - The regex pattern
     * @param options - The regex options
     * @returns The builder instance
     *
     * @see https://www.mongodb.com/docs/manual/reference/operator/query/regex/
     */
    public like(field: TSelector, regex: string, options?: string): RSQLBuilderMongoDb<TSelector> {
        return this.regex(field, regex, options);
    }

    /** Add a NOT LIKE condition.
     *
     * @param field - The field name
     * @param regex - The regex pattern
     * @param options - The regex options
     * @returns The builder instance
     *
     * @see https://www.mongodb.com/docs/manual/reference/operator/query/regex/
     */
    public notLike(field: TSelector, regex: string, options?: string): RSQLBuilderMongoDb<TSelector> {
        return this.notRegex(field, regex, options);
    }

    /** Add a FIELD EXISTS condition.
     *
     * @param field - The field name
     * @returns The builder instance
     */
    public exists(field: TSelector): RSQLBuilderMongoDb<TSelector> {
        super.addComparison(field, 'exists', true);
        return this;
    }

    /** Add a FIELD NOT EXISTS condition.
     *
     * @param field - The field name
     * @returns The builder instance
     */
    public notExists(field: TSelector): RSQLBuilderMongoDb<TSelector> {
        super.addComparison(field, 'exists', false);
        return this;
    }
}

export default RSQLBuilderMongoDb;
