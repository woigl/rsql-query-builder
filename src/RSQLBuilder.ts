type LogicOperator = 'and' | 'or';

type ComparisonOperator =
    | 'equal'
    | 'notEqual'
    | 'lessThan'
    | 'greaterThan'
    | 'lessThanOrEqual'
    | 'greaterThanOrEqual'
    | 'in'
    | 'notIn';

type ComparisonOperatorRSQL = '==' | '!=' | '=lt=' | '=gt=' | '=le=' | '=ge=' | '=in=' | '=out=';

type ComparisonOperators<TComparisonOperator extends string, TComparisonOperatorRSQL extends string> = {
    [key in TComparisonOperator]: TComparisonOperatorRSQL;
};

const comparisonOperators: ComparisonOperators<ComparisonOperator, ComparisonOperatorRSQL> = {
    equal: '==',
    notEqual: '!=',
    lessThan: '=lt=',
    greaterThan: '=gt=',
    lessThanOrEqual: '=le=',
    greaterThanOrEqual: '=ge=',
    in: '=in=',
    notIn: '=out='
};

/** RSQL builder options.
 * 
 * @template TComparisonOperator - The type of the custom comparison operators
 * @template TComparisonOperatorRSQL - The type of the custom comparison operators RSQL
 */
export interface RSQLBuilderOptions<
    TComparisonOperator extends string = never,
    TComparisonOperatorRSQL extends string = never
> {
    /* The default operator used if not explicitly specified */
    defaultMissingOperator?: LogicOperator;
    /* If true, it will replace the existing operator at the end of the string */
    replaceExistingLogicOperator?: boolean;
    /* Custom comparison operators */
    customComparisonOperators?: ComparisonOperators<TComparisonOperator, TComparisonOperatorRSQL>;
}

/** RSQL builder internal class
 * @see https://www.npmjs.com/package/rsql-mongodb
 *
 * @template TSelector - The type of the selector. It is used to define the field names and is a list of strings.
 */
class RSQLBuilder<
    TSelector extends string,
    TCustomComparisonOperator extends string = never,
    TCustomComparisonOperatorRSQL extends string = never
> {
    private rsqlStr = '';
    private defaultMissingOperator: LogicOperator = 'and';
    private replaceExistingLogicOperator: boolean = true;
    private customComparisonOperators: ComparisonOperators<TCustomComparisonOperator, TCustomComparisonOperatorRSQL> =
        {} as ComparisonOperators<TCustomComparisonOperator, TCustomComparisonOperatorRSQL>;

        /** Create a new RSQL builder.
         * 
         * @param options - The builder options
         * @param options.defaultMissingOperator - The default operator used if not explicitly specified
         * @param options.replaceExistingLogicOperator - If true, it will replace the existing operator at the end of the string
         * @param options.customComparisonOperators - Custom comparison operators
         * @returns The builder instance
         * */
    constructor(options: RSQLBuilderOptions<TCustomComparisonOperator, TCustomComparisonOperatorRSQL> = {}) {
        if (options.defaultMissingOperator) this.defaultMissingOperator = options.defaultMissingOperator;

        if (options.replaceExistingLogicOperator)
            this.replaceExistingLogicOperator = options.replaceExistingLogicOperator;

        if (options.customComparisonOperators) this.customComparisonOperators = options.customComparisonOperators;
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

    /** Ensure that the string ends with an operator.
     *
     * @param logicOperator - The logic operator to append. If not supplied then it will use the default operator of the class options.
     */
    private ensureLogicOperator(logicOperator?: LogicOperator): void {
        if (this.rsqlStr.length === 0) return;
        if (!this.rsqlStr.endsWith(';') && !this.rsqlStr.endsWith(',')) {
            this.appendLogicOperator(logicOperator || this.defaultMissingOperator);
        }
    }

    /** Removes AND and OR logic operators from end of the string */
    private trimEndLogicOperator(): void {
        while (this.rsqlStr.endsWith(';') || this.rsqlStr.endsWith(',')) this.rsqlStr = this.rsqlStr.slice(0, -1);
    }

    /** Append an AND or OR operator.
     * In case if there is an existing operator at the end of the string, it will be replaced.
     *
     * @param operator - The operator to append
     */
    private appendLogicOperator(logicOperator: LogicOperator): void {
        if (this.replaceExistingLogicOperator) this.trimEndLogicOperator();

        switch (logicOperator) {
            case 'or':
                this.rsqlStr += ',';
                break;
            case 'and':
            default:
                this.rsqlStr += ';';
                break;
        }
    }

    /** Add a comparison.
     * 
     * @param field - The field name
     * @param comparisonOperator - The comparison operator
     * @param value - The value to compare
     * @returns The builder instance
     * @throws Error if the comparison operator is invalid
     * */
    public addComparison(
        field: TSelector,
        comparisonOperator: ComparisonOperator | TCustomComparisonOperator,
        value: string | number | boolean | Date | null | Array<string | number | boolean | Date | null>
    ): RSQLBuilder<TSelector, TCustomComparisonOperator, TCustomComparisonOperatorRSQL> {
        this.ensureLogicOperator();

        const operator =
            comparisonOperators[comparisonOperator as ComparisonOperator] ||
            this.customComparisonOperators[comparisonOperator as TCustomComparisonOperator];

        if (!operator) throw new Error(`Invalid comparison operator '${operator}'.`);

        if (Array.isArray(value)) {
            const strArray = value.map((value) => this.valueToString(value));
            this.rsqlStr += field + operator + '(' + strArray.join(',') + ')';
        } else {
            this.rsqlStr += field + operator + this.valueToString(value);
        }

        return this;
    }

    /** Add a logic operator.
     * 
     * @param logicOperator - The logic operator
     * @returns The builder instance
     */
    public addLogicOperator(logicOperator: LogicOperator): RSQLBuilder<TSelector, TCustomComparisonOperator, TCustomComparisonOperatorRSQL> {
        this.appendLogicOperator(logicOperator);
        return this;
    }

    /** Get the RSQL string.
     *
     * @returns The RSQL string
     */
    public toString(): string {
        return this.rsqlStr;
    }

    /** Check if the builder is empty.
     *
     * @returns True if the builder is empty
     */
    public isEmpty(): boolean {
        return this.rsqlStr.length === 0;
    }

    /** Reset the builder.
     *
     * @returns The builder instance
     */
    public reset(): RSQLBuilder<TSelector, TCustomComparisonOperator, TCustomComparisonOperatorRSQL> {
        this.rsqlStr = '';

        return this;
    }

    /** Append another RSQL builder
     *
     * @param builder - The builder to append
     * @returns The builder instance
     */
    public append(
        builder: RSQLBuilder<TSelector, TCustomComparisonOperator, TCustomComparisonOperatorRSQL>
    ): RSQLBuilder<TSelector, TCustomComparisonOperator, TCustomComparisonOperatorRSQL> {
        if (!builder.isEmpty()) {
            this.ensureLogicOperator();
            this.rsqlStr += builder.toString();
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
    public merge(
        builders: RSQLBuilder<TSelector, TCustomComparisonOperator, TCustomComparisonOperatorRSQL>[],
        options?: { operator?: LogicOperator; envelopeInGroup?: boolean }
    ): RSQLBuilder<TSelector, TCustomComparisonOperator, TCustomComparisonOperatorRSQL> {
        for (const builder of builders) {
            this.ensureLogicOperator(options?.operator);
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
    public and(): RSQLBuilder<TSelector, TCustomComparisonOperator, TCustomComparisonOperatorRSQL> {
        this.appendLogicOperator('and');
        return this;
    }

    /** Add an OR link.
     *
     * @returns The builder instance
     */
    public or(): RSQLBuilder<TSelector, TCustomComparisonOperator, TCustomComparisonOperatorRSQL> {
        this.appendLogicOperator('or');
        return this;
    }

    /** Add a condition group.
     *
     * @param builder - The builder to form the group
     * @returns The builder instance
     */
    public group(builder: RSQLBuilder<TSelector, TCustomComparisonOperator, TCustomComparisonOperatorRSQL>) {
        this.ensureLogicOperator();
        this.rsqlStr += '(' + builder.toString() + ')';
        return this;
    }

    /** Add an EQUALS condition.
     *
     * @param field - The field name
     * @param value - The value to compare
     * @returns The builder instance
     */
    public equal(
        field: TSelector,
        value: string | number | Date | null
    ): RSQLBuilder<TSelector, TCustomComparisonOperator, TCustomComparisonOperatorRSQL> {
        return this.addComparison(field, 'equal', value);
    }

    /** Add a NOT EQUALS condition.
     *
     * @param field - The field name
     * @param value - The value to compare
     * @returns The builder instance
     */
    public notEqual(field: TSelector, value: string | number | Date | null): RSQLBuilder<TSelector, TCustomComparisonOperator, TCustomComparisonOperatorRSQL> {
        return this.addComparison(field, 'notEqual', value);
    }

    /** Add a LESS THAN condition.
     *
     * @param field - The field name
     * @param value - The value to compare
     * @returns The builder instance
     */
    public lessThan(field: TSelector, value: string | number | Date | null): RSQLBuilder<TSelector, TCustomComparisonOperator, TCustomComparisonOperatorRSQL> {
        return this.addComparison(field, 'lessThan', value);
    }

    /** Add a LESS THAN OR EQUALS condition.
     *
     * @param field - The field name
     * @param value - The value to compare
     * @returns The builder instance
     */
    public lessThanOrEqual(field: TSelector, value: string | number | Date | null): RSQLBuilder<TSelector, TCustomComparisonOperator, TCustomComparisonOperatorRSQL> {
        return this.addComparison(field, 'lessThanOrEqual', value);
    }

    /** Add a GREATER THAN condition.
     *
     * @param field - The field name
     * @param value - The value to compare
     * @returns The builder instance
     */
    public greaterThan(field: TSelector, value: string | number | Date | null): RSQLBuilder<TSelector, TCustomComparisonOperator, TCustomComparisonOperatorRSQL> {
        return this.addComparison(field, 'greaterThan', value);
    }

    /** Add a GREATER THAN OR EQUALS condition.
     *
     * @param field - The field name
     * @param value - The value to compare
     * @returns The builder instance
     */
    public greaterThanOrEquals(field: TSelector, value: string | number | Date | null): RSQLBuilder<TSelector, TCustomComparisonOperator, TCustomComparisonOperatorRSQL> {
        return this.addComparison(field, 'greaterThanOrEqual', value);
    }

    /** Add a IN condition.
     *
     * @param field - The field name
     * @param values - The values to compare
     * @returns The builder instance
     */
    public in(field: TSelector, values: Array<string | number | boolean | null>): RSQLBuilder<TSelector, TCustomComparisonOperator, TCustomComparisonOperatorRSQL> {
        return this.addComparison(field, 'in', values);
    }

    /** Add a NOT IN condition.
     *
     * @param field - The field name
     * @param values - The values to compare
     * @returns The builder instance
     */
    public notIn(field: TSelector, values: Array<string | number | boolean | null>): RSQLBuilder<TSelector, TCustomComparisonOperator, TCustomComparisonOperatorRSQL> {
        return this.addComparison(field, 'notIn', values);
    }

    /** Merge multiple RSQL builders
     *
     * @param builders - The builders to merge.
     * @param options - The merge options.
     * @param options.operator - The operator to use for merging. If not supplied then it will use the default operator of the class options.
     * @param options.envelopeInGroup - If true, the merged builders will be enveloped in a group instead of being merged flat as is.
     * @returns The merged builder.
     */
    static merge<TSelector extends string,
    TCustomComparisonOperator extends string = never,
    TCustomComparisonOperatorRSQL extends string = never>(
        options: RSQLBuilderOptions<TCustomComparisonOperator, TCustomComparisonOperatorRSQL> = {},
        builders: RSQLBuilder<TSelector, TCustomComparisonOperator, TCustomComparisonOperatorRSQL>[]
    ): RSQLBuilder<TSelector, TCustomComparisonOperator, TCustomComparisonOperatorRSQL> {
        return new RSQLBuilder<TSelector, TCustomComparisonOperator, TCustomComparisonOperatorRSQL>(options).merge(builders);
    }
}

export default RSQLBuilder;
