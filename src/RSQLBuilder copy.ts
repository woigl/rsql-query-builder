// Reference https://www.npmjs.com/package/rsql-mongodb

type LogicOperator = 'and' | 'or';

const ReservedChars = ['"', "'", '(', ')', ';', ',', '=', '!', '~', '<', '>', ' ', '\n', '\t', '\r'];

/** RSQL builder options */
interface RSQLBuilderOptions {
    /* The default operator used if not explicitly specified */
    defaultMissingOperator?: LogicOperator;
    /* If true, it will replace the existing operator at the end of the string */
    replaceExistingLogicOperator?: boolean;
}

/** RSQL builder internal class
 * @see https://www.npmjs.com/package/rsql-mongodb
 *
 * @template Selector - The type of the selector. It is used to define the field names and is a list of strings.
 */
class RSQLBuilder<Selector extends string> {
    private str = '';
    private defaultMissingOperator: LogicOperator = 'and';
    private replaceExistingLogicOperator: boolean = true;

    constructor(options: RSQLBuilderOptions = {}) {
        if (options.defaultMissingOperator) this.defaultMissingOperator = options.defaultMissingOperator;

        if (options.replaceExistingLogicOperator)
            this.replaceExistingLogicOperator = options.replaceExistingLogicOperator;
    }

    /** Get the RSQL string.
     * 
     * @returns The RSQL string
     */
    public toString(): string {
        return this.str;
    }

    /** Removes AND and OR operators from end of the string */
    private trimEndOperator(): void {
        while (this.str.endsWith(';') || this.str.endsWith(',')) this.str = this.str.slice(0, -1);
    }

    /** Append an AND or OR operator.
     * In case if there is an existing operator at the end of the string, it will be replaced.
     * 
     * @param operator - The operator to append
    */
    private appendOperator(operator: LogicOperator): void {
        if (this.replaceExistingLogicOperator) this.trimEndOperator();

        switch (operator) {
            case 'or':
                this.str += ',';
                break;
            case 'and':
            default:
                this.str += ';';
                break;
        }
    }

    /** Ensure that the string ends with an operator.
     * 
     * @param operator - The operator to append. If not supplied then it will use the default operator of the class options.
    */
    private ensureOperator(operator?: LogicOperator): void {
        if (this.str.length === 0) return;
        if (!this.str.endsWith(';') && !this.str.endsWith(',')) {
            this.appendOperator(operator || this.defaultMissingOperator);
        }
    }

    /** Escape special characters.
     * 
     * @param input - The input string to escape
     * @returns The escaped string
    */
    private escapeString(input: string): string {
        const regex = /[();,]/g;

        return input.replace(regex, '\\$&');
    }

    /** Convert a value to an escaped string.
     * 
     * @param value - The value to convert
     * @returns The string representation of the value
     * @throws Error if the value type is not handled
    */
    private valueToString(
        value: string | number | boolean | Date | null | Array<string | number | boolean | Date | null>
    ): string {
        if (value === null) return 'null';
        if (typeof value === 'string') return '"' + this.escapeString(value) + '"';
        if (typeof value === 'number') return value.toFixed();
        if (typeof value === 'boolean') return value === true ? 'true' : 'false';
        if (value instanceof Date) return value.toISOString();
        throw new Error('Unhandled value type.');
    }

    /** Check if the builder is empty.
     * 
     * @returns True if the builder is empty
     */
    public isEmpty(): boolean {
        return this.str.length === 0;
    }

    /** Reset the builder.
     * 
     * @returns The builder instance
    */
    public reset(): RSQLBuilder<Selector> {
        this.str = '';

        return this;
    }

    /** Append another RSQL builder
     * 
     * @param builder - The builder to append
     * @returns The builder instance
    */
    public append(builder: RSQLBuilder<Selector>): RSQLBuilder<Selector> {
        if (!builder.isEmpty()) {
            this.ensureOperator();
            this.str += builder.toString();
        }
        return this;
    }

    /** Merge multiple RSQL builders
     * 
     * @param builders - The builders to merge.
     * @param options - The merge options.
     * @param options.operator - The operator to use for merging. If not supplied then it will use the default operator of the class options.
     * @param options.envelopeInGroup - If true, the merged builders will be enveloped in a group instead of being merged flat as is.
     * @returns The builder instance
    */
    public merge(builders: RSQLBuilder<Selector>[], options?: {operator?: LogicOperator, envelopeInGroup?: boolean}): RSQLBuilder<Selector> {
        for (const builder of builders) {
            this.ensureOperator(options?.operator);
            if (options?.envelopeInGroup) {
                // merge the builder enveloped in a a group
                this.group(builder);
            } else {
                // merge the builder flat as is
                this.append(builder);
            }
        }

        return this;
    }

    /** Add an AND link.
     * 
     * @returns The builder instance
    */
    public and(): RSQLBuilder<Selector> {
        this.appendOperator('and');
        return this;
    }

    /** Add an OR link.
     * 
     * @returns The builder instance
    */
    public or(): RSQLBuilder<Selector> {
        this.appendOperator('or');
        return this;
    }

    /** Add a condition group.
     * 
     * @param builder - The builder to form the group
     * @returns The builder instance
    */
    public group(builder: RSQLBuilder<Selector>) {
        this.ensureOperator();
        this.str += '(' + builder.toString() + ')';
        return this;
    }

    /** Add an EQUALS condition.
     * 
     * @param field - The field name
     * @param value - The value to compare
     * @returns The builder instance
    */
    public equals(field: Selector, value: string | number | Date | null): RSQLBuilder<Selector> {
        this.ensureOperator();
        this.str += field + '==' + this.valueToString(value);
        return this;
    }

    /** Add a NOT EQUALS condition.
     * 
     * @param field - The field name
     * @param value - The value to compare
     * @returns The builder instance
    */
    public notEquals(field: Selector, value: string | number | Date | null): RSQLBuilder<Selector> {
        this.ensureOperator();
        this.str += field + '!=' + this.valueToString(value);
        return this;
    }

    /** Add a LESS THAN condition.
     * 
     * @param field - The field name
     * @param value - The value to compare
     * @returns The builder instance
    */
    public lessThan(field: Selector, value: string | number | Date | null): RSQLBuilder<Selector> {
        this.ensureOperator();
        this.str += field + '=lt=' + this.valueToString(value);
        return this;
    }

    /** Add a LESS THAN OR EQUALS condition.
     * 
     * @param field - The field name
     * @param value - The value to compare
     * @returns The builder instance
    */
    public lessThanOrEquals(field: Selector, value: string | number | Date | null): RSQLBuilder<Selector> {
        this.ensureOperator();
        this.str += field + '=le=' + this.valueToString(value);
        return this;
    }

    /** Add a GREATER THAN condition.
     * 
     * @param field - The field name
     * @param value - The value to compare
     * @returns The builder instance
    */
    public greaterThan(field: Selector, value: string | number | Date | null): RSQLBuilder<Selector> {
        this.ensureOperator();
        this.str += field + '=gt=' + this.valueToString(value);
        return this;
    }

    /** Add a GREATER THAN OR EQUALS condition.
     * 
     * @param field - The field name
     * @param value - The value to compare
     * @returns The builder instance
    */
    public greaterThanOrEquals(field: Selector, value: string | number | Date | null): RSQLBuilder<Selector> {
        this.str += field + '=ge=' + this.valueToString(value);

        return this;
    }

    /** Add a IN condition.
     * 
     * @param field - The field name
     * @param values - The values to compare
     * @returns The builder instance
    */
    public in(field: Selector, ...values: Array<string | number | boolean | null>): RSQLBuilder<Selector> {
        this.ensureOperator();
        const strArray = values.map((value) => this.valueToString(value));
        this.str += field + '=in=(' + strArray.join(',') + ')';
        return this;
    }

    /** Add a NOT IN condition.
     * 
     * @param field - The field name
     * @param values - The values to compare
     * @returns The builder instance
    */
    public notIn(field: Selector, ...values: Array<string | number | boolean | null>): RSQLBuilder<Selector> {
        this.ensureOperator();
        const strArray = values.map((value) => this.valueToString(value));
        this.str += field + '=out=(' + strArray.join(',') + ')';
        return this;
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
    public regex(field: Selector, regex: string, options?: string): RSQLBuilder<Selector> {
        this.ensureOperator();
        this.str += field + '=regex=' + regex + (options !== undefined ? '=' + options : '');
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
        this.ensureOperator();
        this.str += field + '=notregex=' + regex + (options !== undefined ? '=' + options : '');
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
        this.ensureOperator();
        this.str += field + '=exists=true';
        return this;
    }

    /** Add a FIELD NOT EXISTS condition.
     * 
     * @param field - The field name
     * @returns The builder instance
     */
    public notExists(field: Selector): RSQLBuilder<Selector> {
        this.ensureOperator();
        this.str += field + '=exists=false';
        return this;
    }

    /** Merge multiple RSQL builders
     * 
     * @param builders - The builders to merge.
     * @param options - The merge options.
     * @param options.operator - The operator to use for merging. If not supplied then it will use the default operator of the class options.
     * @param options.envelopeInGroup - If true, the merged builders will be enveloped in a group instead of being merged flat as is.
     * @returns The merged builder.
     */
    static merge<Selector extends string>(
        options: RSQLBuilderOptions = {},
        builders: RSQLBuilder<Selector>[]
    ): RSQLBuilder<Selector> {
        return new RSQLBuilder(options).merge(builders);
    }
}

export default RSQLBuilder;
