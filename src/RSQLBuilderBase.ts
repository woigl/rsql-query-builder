type LogicOperator = 'and' | 'or';

type ComparisonOperatorsDefault =
    | 'equal'
    | 'notEqual'
    | 'lessThan'
    | 'greaterThan'
    | 'lessThanOrEqual'
    | 'greaterThanOrEqual'
    | 'in'
    | 'notIn';

type ComparisonOperators<TComparisonOperator extends string> = {
    [key in TComparisonOperator]: { rsql: string; isArray?: boolean };
};

/** RSQL builder options.
 *
 * @template TComparisonOperator - The type of the custom comparison operators
 */
export interface RSQLBuilderOptions<TComparisonOperator extends string = never> {
    /* The default operator used if not explicitly specified */
    defaultLogicOperator?: LogicOperator;
}

/** RSQL base builder options.
 *
 * @template TComparisonOperator - The type of the custom comparison operators
 */
interface RSQLBuilderBaseOptions<TComparisonOperator extends string = never>
    extends RSQLBuilderOptions<TComparisonOperator> {
    /* Custom comparison operators */
    customComparisonOperators?: Partial<ComparisonOperators<TComparisonOperator>>;
}

/** RSQL builder base class
 *
 * This base class can be extended for speific builders to more comparison operator.
 *
 * @template TSelector - The type of the selector.
 */
class RSQLBuilderBase<TSelector extends string, TCustomComparisonOperator extends string> {
    private readonly comparisonOperators: ComparisonOperators<ComparisonOperatorsDefault> = {
        equal: { rsql: '==' },
        notEqual: { rsql: '!=' },
        lessThan: { rsql: '=lt=' },
        greaterThan: { rsql: '=gt=' },
        lessThanOrEqual: { rsql: '=le=' },
        greaterThanOrEqual: { rsql: '=ge=' },
        in: { rsql: '=in=', isArray: true },
        notIn: { rsql: '=out=', isArray: true }
    };

    private rsqlStr = '';

    private defaultLogicOperator: LogicOperator = 'and';
    private replaceExistingLogicOperator: boolean = true;
    private customComparisonOperators: Partial<
        ComparisonOperators<ComparisonOperatorsDefault | TCustomComparisonOperator>
    > = {} as ComparisonOperators<ComparisonOperatorsDefault | TCustomComparisonOperator>;

    /** Create a new RSQL builder base instance.
     *
     * @param options - The builder options
     * @param options.defaultLogicOperator - The default operator used if not explicitly specified
     * @param options.customComparisonOperators - Custom comparison operators
     *
     * @returns The builder instance
     * */
    protected constructor(
        options: RSQLBuilderBaseOptions<ComparisonOperatorsDefault | TCustomComparisonOperator> = {}
    ) {
        if (options.defaultLogicOperator) this.defaultLogicOperator = options.defaultLogicOperator;
        if (options.customComparisonOperators) this.customComparisonOperators = options.customComparisonOperators;
    }

    /** Escape special characters.
     *
     * @param input - The input string to escape
     *
     * @returns The escaped string
     */
    private escapeString(input: string): string {
        const regex = /[();,]/g;

        return input.replace(regex, '\\$&');
    }

    /** Convert a value to an escaped string.
     *
     * @param value - The value to convert
     *
     * @returns The string representation of the value
     *
     * @throws Error if the value type is not handled
     */
    private valueToString(
        value: string | number | boolean | Date | null | Array<string | number | boolean | Date | null>
    ): string {
        if (value === null) return 'null';
        if (typeof value === 'string') return '"' + this.escapeString(value) + '"';
        if (typeof value === 'number') return value.toString();
        if (typeof value === 'boolean') return value === true ? 'true' : 'false';
        if (value instanceof Date) return value.toISOString();
        throw new Error('Unhandled value type');
    }

    /** Ensure that the string ends with an logic operator.
     *
     * @param logicOperator - The logic operator to append. If not supplied then it will use the default logic operator of the class options.
     */
    private ensureLogicOperator(logicOperator?: LogicOperator): void {
        if (this.rsqlStr.length === 0) return;
        if (!this.rsqlStr.endsWith(';') && !this.rsqlStr.endsWith(',')) {
            this.appendLogicOperator(logicOperator || this.defaultLogicOperator);
        }
    }

    /** Removes AND and OR logic operators from end of the string */
    private removeTrailingLogicOperator(): void {
        while (this.rsqlStr.endsWith(';') || this.rsqlStr.endsWith(',')) this.rsqlStr = this.rsqlStr.slice(0, -1);
    }

    /** Append an AND or OR logic operator.
     * In case if there is an existing operator at the end of the string, it will be replaced.
     *
     * @param operator - The operator to append
     */
    private appendLogicOperator(logicOperator: LogicOperator): void {
        if (this.replaceExistingLogicOperator) this.removeTrailingLogicOperator();

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
     * @param selector - The selector name
     * @param comparisonOperator - The comparison operator
     * @param value - The value to compare
     * @param options - The options string for the comparison
     *
     * @returns The builder instance
     *
     * @throws Error if the comparison operator is invalid
     * @throws Error if the value is an array and the operator does not support arrays
     * */
    protected addComparison(
        selector: TSelector,
        comparisonOperator: ComparisonOperatorsDefault | TCustomComparisonOperator,
        value: string | number | boolean | Date | null | Array<string | number | boolean | Date | null>,
        options?: string
    ): this {
        this.ensureLogicOperator();

        const operator =
            this.customComparisonOperators[comparisonOperator as TCustomComparisonOperator] ||
            this.comparisonOperators[comparisonOperator as ComparisonOperatorsDefault];

        if (!operator) throw new Error(`Invalid comparison operator '${operator}'`);

        const optionsStr = options ? '=' + options : '';

        if (operator.isArray === true) {
            if (!Array.isArray(value)) {
                throw new Error(`Array comparison operator '${operator}' requires an array value.`);
            }

            const strArray = value.map((value) => this.valueToString(value));

            this.rsqlStr += selector + operator.rsql + '(' + strArray.join(',') + ')' + optionsStr;
        } else {
            if (Array.isArray(value)) {
                throw new Error(`Non-array comparison operator '${operator}' does not support array values.`);
            }

            this.rsqlStr += selector + operator.rsql + this.valueToString(value) + optionsStr;
        }

        return this;
    }

    /** Add a logic operator.
     *
     * @param logicOperator - The logic operator
     * @returns The builder instance
     */
    protected addLogicOperator(logicOperator: LogicOperator): this {
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

    /** Reset the builder to be empty.
     *
     * @returns The builder instance
     */
    public reset(): this {
        this.rsqlStr = '';

        return this;
    }

    /** Concat another RSQL builder.
     *
     * This concatenates a RSQL builder to the current builder on the same level.
     *
     * @param builder - The builder to append
     *
     * @returns The builder instance
     */
    public concat(builder: this): this {
        if (!builder.isEmpty()) {
            this.ensureLogicOperator();
            this.rsqlStr += builder.toString();
        }
        return this;
    }

    /** Merge multiple RSQL builders
     *
     * This merges multiple RSQL builders into a single builder, each one encapsulated in a group.
     *
     * @param builders - The builders to merge.
     * @param options - The merge options.
     * @param options.operator - The logic operator to be used for merging. If not supplied then it will use the default logic operator of the class options.
     *
     * @returns The builder instance
     */
    public merge(builders: this[], options?: { logicOperator?: LogicOperator }): this {
        for (const builder of builders) {
            this.ensureLogicOperator(options?.logicOperator);
            this.group(builder);
        }

        return this;
    }

    /** Add an AND logic operator.
     *
     * @returns The builder instance
     */
    public and(): this {
        this.appendLogicOperator('and');
        return this;
    }

    /** Add an OR logc operator.
     *
     * @returns The builder instance
     */
    public or(): this {
        this.appendLogicOperator('or');
        return this;
    }

    /** Add a condition group.
     *
     * @param builder - The builder to form the group
     *
     * @returns The builder instance
     */
    public group(builder: this) {
        this.ensureLogicOperator();
        this.rsqlStr += '(' + builder.toString() + ')';
        return this;
    }

    /** Add an EQUALS condition.
     *
     * @param selector - The selector name
     * @param value - The value to compare
     *
     * @returns The builder instance
     */
    public equal(selector: TSelector, value: string | number | boolean | Date | null): this {
        return this.addComparison(selector, 'equal', value);
    }

    /** Add a NOT EQUALS condition.
     *
     * @param selector - The selector name
     * @param value - The value to compare
     *
     * @returns The builder instance
     */
    public notEqual(selector: TSelector, value: string | number | boolean | Date | null): this {
        return this.addComparison(selector, 'notEqual', value);
    }

    /** Add a LESS THAN condition.
     *
     * @param selector - The selector name
     * @param value - The value to compare
     *
     * @returns The builder instance
     */
    public lessThan(selector: TSelector, value: string | number | Date | null): this {
        return this.addComparison(selector, 'lessThan', value);
    }

    /** Add a LESS THAN OR EQUAL condition.
     *
     * @param selector - The selector name
     * @param value - The value to compare
     *
     * @returns The builder instance
     */
    public lessThanOrEqual(selector: TSelector, value: string | number | Date | null): this {
        return this.addComparison(selector, 'lessThanOrEqual', value);
    }

    /** Add a GREATER THAN condition.
     *
     * @param selector - The selector name
     * @param value - The value to compare
     *
     * @returns The builder instance
     */
    public greaterThan(selector: TSelector, value: string | number | Date | null): this {
        return this.addComparison(selector, 'greaterThan', value);
    }

    /** Add a GREATER THAN OR EQUAL condition.
     *
     * @param selector - The selector name
     * @param value - The value to compare
     *
     * @returns The builder instance
     */
    public greaterThanOrEqual(selector: TSelector, value: string | number | Date | null): this {
        return this.addComparison(selector, 'greaterThanOrEqual', value);
    }

    /** Add a IN condition.
     *
     * @param selector - The selector name
     * @param values - The values to compare
     * @returns The builder instance
     */
    public in(selector: TSelector, values: Array<string | number | boolean | null>): this {
        return this.addComparison(selector, 'in', values);
    }

    /** Add a NOT IN condition.
     *
     * @param selector - The selector name
     * @param values - The values to compare
     *
     * @returns The builder instance
     */
    public notIn(selector: TSelector, values: Array<string | number | boolean | null>): this {
        return this.addComparison(selector, 'notIn', values);
    }

    /** Merge multiple RSQL builders.
     *
     * This is a static method that merges multiple RSQL builders into a single builder, each one encapsulated in a group.
     *
     * @param options - The merge options.
     * @param options.operator - The operator to use for merging. If not supplied then it will use the default operator of the class options.
     * @param builders - The builders to merge.
     *
     * @returns The merged builder.
     */
    static merge<TSelector extends string, TCustomComparisonOperator extends string>(
        builders: RSQLBuilderBase<TSelector, TCustomComparisonOperator>[],
        options?: { logicOperator?: LogicOperator }
    ): RSQLBuilderBase<TSelector, TCustomComparisonOperator> {
        return new RSQLBuilderBase<TSelector, TCustomComparisonOperator>({
            defaultLogicOperator: options?.logicOperator
        }).merge(builders.filter((b) => b !== undefined && !b.isEmpty()));
    }
}

export default RSQLBuilderBase;
