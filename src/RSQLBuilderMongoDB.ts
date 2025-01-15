// Reference https://www.npmjs.com/package/rsql-mongodb

import RSQLBuilder, { RSQLBuilderOptions } from './RSQLBuilder.js';

type MongoDbComparisonOperator = 'regex' | 'notRegex' | 'exists';
type MongoDbComparisonOperatorRSQL = '=regex=' | '=notregex=' | '=exists=';

/** RSQL Query Builder for MongoDB.
 *
 * @template Selector - The type of the selector. It is used to define the field names and is a list of strings.
 */
class RSQLBuilderMongoDb<Selector extends string> extends RSQLBuilder<Selector, MongoDbComparisonOperator, MongoDbComparisonOperatorRSQL> {
    constructor(
        options: RSQLBuilderOptions<MongoDbComparisonOperator, MongoDbComparisonOperatorRSQL> = {
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
    public regex(field: Selector, regex: string, options?: string): RSQLBuilderMongoDb<Selector> {
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
    public notRegex(field: Selector, regex: string, options?: string): RSQLBuilder<Selector> {
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
    public like(field: Selector, regex: string, options?: string): RSQLBuilder<Selector> {
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
    public notLike(field: Selector, regex: string, options?: string): RSQLBuilder<Selector> {
        return this.notRegex(field, regex, options);
    }

    /** Add a FIELD EXISTS condition.
     *
     * @param field - The field name
     * @returns The builder instance
     */
    public exists(field: Selector): RSQLBuilder<Selector> {
        super.addComparison(field, 'exists', true);
        return this;
    }

    /** Add a FIELD NOT EXISTS condition.
     *
     * @param field - The field name
     * @returns The builder instance
     */
    public notExists(field: Selector): RSQLBuilder<Selector> {
        super.addComparison(field, 'exists', false);
        return this;
    }
}

export default RSQLBuilderMongoDb;
