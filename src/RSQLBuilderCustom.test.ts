import { describe, it, expect } from 'vitest';
import { RSQLBuilder, RSQLBuilderBase, RSQLBuilderOptions } from '.';

class RSQLBuilderCustom<TSelector extends string = string> extends RSQLBuilderBase<
    TSelector,
    'isMonth' | 'isUpperCase' | 'isInGroup'
> {
    constructor() {
        super({
            customComparisonOperators: {
                equal: { rsql: '=eq=' },
                notEqual: { rsql: '=neq=' },
                isMonth: { rsql: '=im=' },
                isUpperCase: { rsql: '=iuc=' },
                isInGroup: { rsql: '=iic=', isArray: true }
            }
        });
    }

    /**
     * Mockup test for parent function addLogicOperator with 'and' operator
     * 
     * @returns The builder instance
     */
    public testAddLogicOperatorAnd(): this {
        this.addLogicOperator('and');
        return this;
    }

    /**
     * Mockup test for parent function addLogicOperator with 'or' operator
     * 
     * @returns The builder instance
     */
    public testAddLogicOperatorOr(): this {
        this.addLogicOperator('or');
        return this;
    }

    /**
     * Function to test the custom comparison operator 'isUpperCase'
     *
     * @param selector - The selector name
     * @returns The builder instance
     */
    public isUpperCase(selector: TSelector): this {
        super.addComparison(selector, 'isUpperCase', true);
        return this;
    }

    /**
     * Function to test the custom comparison operator 'isUpperCase'
     *
     * @param selector - The selector name
     * @returns The builder instance
     */
    public isMonth(selector: TSelector): this {
        super.addComparison(selector, 'isMonth', true, 'i');
        return this;
    }

    /**
     * Mockup test for exception 'Unhandled field value'
     *
     * @param selector - The selector name
     * @returns The builder instance
     */
    public testExceptionUnhandledValueType(selector: TSelector): this {
        super.addComparison(selector, 'isUpperCase', this as unknown as string);
        return this;
    }

    /**
     * Mockup test for exception 'Invalid comparison operator'
     *
     * @param selector - The selector name
     * @returns The builder instance
     */
    public testExceptionInvalidComparisonOperator(selector: TSelector): this {
        super.addComparison(selector, 'invalidComparisonOperator' as unknown as 'isUpperCase', true);
        return this;
    }

    public testExceptionArrayComparisonOperatorRequiresArrayValue(
        selector: TSelector,
        value: string | number | boolean | null
    ): this {
        super.addComparison(selector, 'isInGroup', value);
        return this;
    }

    public testExceptionNonArrayComparisonOperatorDoesNotSupportArrayValue(
        selector: TSelector,
        values: Array<string | number | boolean | null>
    ): this {
        super.addComparison(selector, 'isUpperCase', values);
        return this;
    }
}

describe('RSQLBuilder', () => {
    it("Test parent function addLogicOperator", () => {
        expect(new RSQLBuilderCustom().equal('name', 'Filip').testAddLogicOperatorAnd().equal('name', 'John').toString()).toBe('name=eq="Filip";name=eq="John"');
        expect(new RSQLBuilderCustom().equal('name', 'Filip').testAddLogicOperatorOr().equal('name', 'John').toString()).toBe('name=eq="Filip",name=eq="John"');
    });

    it("Test custom comparison operator EQUAL ('=eq=')", () => {
        expect(new RSQLBuilderCustom().equal('name', 'Filip').toString()).toBe('name=eq="Filip"');
        expect(new RSQLBuilderCustom().equal('age', 30).toString()).toBe('age=eq=30');
        expect(new RSQLBuilderCustom().equal('weight', 68.3).toString()).toBe('weight=eq=68.3');
        expect(new RSQLBuilderCustom().equal('adult', true).toString()).toBe('adult=eq=true');
        expect(new RSQLBuilderCustom().equal('created', new Date('2022-04-23T05:46:17.497Z')).toString()).toBe(
            'created=eq=2022-04-23T05:46:17.497Z'
        );
        expect(new RSQLBuilderCustom().equal('name', null).toString()).toBe('name=eq=null');
    });

    it("Test custom comparison operator NOT EQUAL ('=neq=')", () => {
        expect(new RSQLBuilderCustom().notEqual('name', 'Filip').toString()).toBe('name=neq="Filip"');
        expect(new RSQLBuilderCustom().notEqual('age', 30).toString()).toBe('age=neq=30');
        expect(new RSQLBuilderCustom().notEqual('weight', 68.3).toString()).toBe('weight=neq=68.3');
        expect(new RSQLBuilderCustom().notEqual('adult', false).toString()).toBe('adult=neq=false');
        expect(new RSQLBuilderCustom().notEqual('adult', true).toString()).toBe('adult=neq=true');
        expect(new RSQLBuilderCustom().notEqual('created', new Date('2022-04-23T05:46:17.497Z')).toString()).toBe(
            'created=neq=2022-04-23T05:46:17.497Z'
        );
        expect(new RSQLBuilderCustom().notEqual('name', null).toString()).toBe('name=neq=null');
    });

    it("Test custom comparison operator IS UPPER CASE ('=iuc=')", () => {
        expect(new RSQLBuilderCustom().isUpperCase('name').toString()).toBe('name=iuc=true');
    });

    it("Test custom comparison operator IS MONTH ('=im=true=i')", () => {
        expect(new RSQLBuilderCustom().isMonth('month').toString()).toBe('month=im=true=i');
    });

    it("Test for exception 'Unhandled field value'", () => {
        expect(() => new RSQLBuilderCustom().testExceptionUnhandledValueType('name').toString()).toThrowError(
            expect.objectContaining({ message: 'Unhandled value type' })
        );
    });

    it("Test for exception 'Invalid comparison operator'", () => {
        expect(() => new RSQLBuilderCustom().testExceptionInvalidComparisonOperator('name').toString()).toThrowError(
            expect.objectContaining({ message: "Invalid comparison operator 'undefined'" })
        );
    });

    it("Test for exception 'Invalid comparison operator'", () => {
        expect(() =>
            new RSQLBuilderCustom().testExceptionArrayComparisonOperatorRequiresArrayValue('name', 15).toString()
        ).toThrowError(expect.objectContaining({ message: "Array comparison operator '[object Object]' requires an array value." }));
    });

    it("Test for exception 'Invalid comparison operator'", () => {
        expect(() =>
            new RSQLBuilderCustom()
                .testExceptionNonArrayComparisonOperatorDoesNotSupportArrayValue('name', [15, 30])
                .toString()
        ).toThrowError(expect.objectContaining({ message: "Non-array comparison operator '[object Object]' does not support array values." }));
    });
});
