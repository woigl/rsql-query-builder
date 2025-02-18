import { describe, it, expect } from 'vitest';
import { RSQLBuilder } from './';

describe('RSQLBuilder', () => {
    it("Test operator Equal ('==')", () => {
        expect(new RSQLBuilder().equal('name', 'Filip').toString()).toBe('name=="Filip"');
        expect(new RSQLBuilder().equal('age', 30).toString()).toBe('age==30');
        expect(new RSQLBuilder().equal('weight', 68.3).toString()).toBe('weight==68.3');
        expect(new RSQLBuilder().equal('adult', true).toString()).toBe('adult==true');
        expect(new RSQLBuilder().equal('created', new Date('2022-04-23T05:46:17.497Z')).toString()).toBe(
            'created==2022-04-23T05:46:17.497Z'
        );
        expect(new RSQLBuilder().equal('name', null).toString()).toBe('name==null');
    });

    it("Test operator Not Equal ('!=')", () => {
        expect(new RSQLBuilder().notEqual('name', 'Filip').toString()).toBe('name!="Filip"');
        expect(new RSQLBuilder().notEqual('age', 30).toString()).toBe('age!=30');
        expect(new RSQLBuilder().notEqual('weight', 68.3).toString()).toBe('weight!=68.3');
        expect(new RSQLBuilder().notEqual('adult', false).toString()).toBe('adult!=false');
        expect(new RSQLBuilder().notEqual('adult', true).toString()).toBe('adult!=true');
        expect(new RSQLBuilder().notEqual('created', new Date('2022-04-23T05:46:17.497Z')).toString()).toBe(
            'created!=2022-04-23T05:46:17.497Z'
        );
        expect(new RSQLBuilder().notEqual('name', null).toString()).toBe('name!=null');
    });

    it("Test operator In ('=in=')", () => {
        expect(new RSQLBuilder().in('name', ['Filip', 'John']).toString()).toBe('name=in=("Filip","John")');
        expect(new RSQLBuilder().in('name', [30, 45, 55.5]).toString()).toBe('name=in=(30,45,55.5)');
    });

    it("Test operator Not In ('=out=')", () => {
        expect(new RSQLBuilder().notIn('name', ['Filip', 'John']).toString()).toBe('name=out=("Filip","John")');
        expect(new RSQLBuilder().notIn('name', [30, 45, 55.5]).toString()).toBe('name=out=(30,45,55.5)');
    });

    it("Test operator Less Than ('=lt=')", () => {
        expect(new RSQLBuilder().lessThan('age', 30).toString()).toBe('age=lt=30');
    });

    it("Test operator Greater Than ('=gt=')", () => {
        expect(new RSQLBuilder().greaterThan('age', 30).toString()).toBe('age=gt=30');
    });

    it("Test operator Less Than Or Equal ('=le=')", () => {
        expect(new RSQLBuilder().lessThanOrEqual('age', 30).toString()).toBe('age=le=30');
    });

    it("Test operator Greater Than Or Equal ('=ge=')", () => {
        expect(new RSQLBuilder().greaterThanOrEqual('age', 30).toString()).toBe('age=ge=30');
    });

    it("Test logic operator AND (';')", () => {
        expect(new RSQLBuilder().and().toString()).toBe(';');
        expect(new RSQLBuilder().equal('name', 'John').and().equal('age', 30).toString()).toBe('name=="John";age==30');
    });

    it("Test logic operator OR (',')", () => {
        expect(new RSQLBuilder().or().toString()).toBe(',');
        expect(new RSQLBuilder().equal('name', 'John').or().equal('age', 30).toString()).toBe('name=="John",age==30');
    });

    it("Test default logic operator AND (';')", () => {
        expect(new RSQLBuilder({ defaultLogicOperator: 'and' }).and().toString()).toBe(';');
        expect(new RSQLBuilder({ defaultLogicOperator: 'and' }).equal('name', 'John').equal('age', 30).toString()).toBe(
            'name=="John";age==30'
        );
    });

    it("Test default logic operator OR (',')", () => {
        expect(new RSQLBuilder({ defaultLogicOperator: 'or' }).or().toString()).toBe(',');
        expect(new RSQLBuilder({ defaultLogicOperator: 'or' }).equal('name', 'John').equal('age', 30).toString()).toBe(
            'name=="John",age==30'
        );
    });

    it('Test prevent consecutive occurence of logic operators', () => {
        expect(new RSQLBuilder().and().or().and().and().or().or().and().toString()).toBe(';');
        expect(
            new RSQLBuilder().equal('name', 'John').and().or().and().and().or().or().and().equal('age', 30).toString()
        ).toBe('name=="John";age==30');
    });

    it('Test isEmpty() and reset()', () => {
        expect(new RSQLBuilder().isEmpty()).toBe(true);
        expect(new RSQLBuilder().equal('name', 'John').and().equal('age', 30).reset().isEmpty()).toBe(true);
        expect(new RSQLBuilder().equal('name', 'John').and().equal('age', 30).isEmpty()).toBe(false);
    });

    it('Test group()', () => {
        expect(new RSQLBuilder().equal('name', 'John').and().group(new RSQLBuilder().equal('age', 30).or().equal('age', null)).toString()).toBe('name==\"John\";(age==30,age==null)');
    });

    it('Test concat()', () => {
        expect(new RSQLBuilder().equal('name', 'John').concat(new RSQLBuilder().equal('age', 30).or().equal('age', null)).toString()).toBe('name==\"John\";age==30,age==null');
    });

    it('Test merge()', () => {
        expect(new RSQLBuilder().equal('name', 'John').merge([new RSQLBuilder().equal('age', 30).or().equal('age', null)]).toString()).toBe('name==\"John\";(age==30,age==null)');
    });

    it('Test static merge()', () => {
        expect(RSQLBuilder.merge([new RSQLBuilder().equal('name', 'John'), new RSQLBuilder().equal('age', 30).or().equal('age', null)]).toString()).toBe('(name==\"John\");(age==30,age==null)');
    });
});
