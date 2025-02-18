import { describe, it, expect } from 'vitest';
import { RSQLBuilder, RSQLBuilderBase, RSQLBuilderOptions } from '.';

class RSQLBuilderCustom<TSelector extends string = string> extends RSQLBuilderBase<TSelector, 'isUpperCase'> {
    constructor() {
        super({
            customComparisonOperators: {
                equal: { rsql: '=eq=' },
                notEqual: { rsql: '=neq=' },
                isUpperCase: { rsql: '=iuc=' }
            }
        });
    }

    public isUpperCase(field: TSelector): this {
        super.addComparison(field, 'isUpperCase', true);
        return this;
    }

    public isUpperCase2(field: TSelector): this {
        // mockup to test unhandled field value
        super.addComparison(field, 'isUpperCase', this as unknown as string);
        return this;
    }

    public isUpperCase3(field: TSelector): this {
        super.addComparison(field, 'isUpperCase3' as unknown as 'isUpperCase', true);
        return this;
    }
}

describe('RSQLBuilder', () => {
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

    it("Test for exception 'Unhandled field value'", () => {
        expect(() => new RSQLBuilderCustom().isUpperCase2('name').toString()).toThrowError(
            expect.objectContaining({ message: 'Unhandled value type' })
        );
    });

    it("Test for exception 'Invalid comparison operator'", () => {
        expect(() => new RSQLBuilderCustom().isUpperCase3('name').toString()).toThrowError(
            expect.objectContaining({ message: "Invalid comparison operator 'undefined'" })
        );
    });
});
