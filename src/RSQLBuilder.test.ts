import { describe, it, expect } from 'vitest';
import RSQLBuilder from './RSQLBuilder';

describe('RSQLBuilder', () => {
    it("Test operator Equal ('==')", () => {
        expect(new RSQLBuilder().equal('name', 'Filip').toString()).toBe('name=="Filip"');
        expect(new RSQLBuilder().equal('age', 30).toString()).toBe('age==30');
        expect(new RSQLBuilder().equal('adult', true).toString()).toBe('adult==true');
        expect(new RSQLBuilder().equal('created', new Date('2022-04-23T05:46:17.497Z')).toString()).toBe(
            'created==2022-04-23T05:46:17.497Z'
        );
        expect(new RSQLBuilder().equal('name', null).toString()).toBe('name==null');
    });

    it("Test operator Not Equal ('!=')", () => {
        expect(new RSQLBuilder().notEqual('name', 'Filip').toString()).toBe('name!="Filip"');
        expect(new RSQLBuilder().notEqual('age', 30).toString()).toBe('age!=30');
        expect(new RSQLBuilder().notEqual('adult', true).toString()).toBe('adult!=true');
        expect(new RSQLBuilder().notEqual('created', new Date('2022-04-23T05:46:17.497Z')).toString()).toBe(
            'created!=2022-04-23T05:46:17.497Z'
        );
        expect(new RSQLBuilder().notEqual('name', null).toString()).toBe('name!=null');
    });

    it("Test operator In ('=in=')", () => {
        expect(new RSQLBuilder().in('name', ['Filip', 'John']).toString()).toBe('name=in=("Filip","John")');
        expect(new RSQLBuilder().in('name', [30, 45]).toString()).toBe('name=in=(30,45)');
    });

    it("Test operator Not In ('=out=')", () => {
        expect(new RSQLBuilder().notIn('name', ['Filip', 'John']).toString()).toBe('name=out=("Filip","John")');
        expect(new RSQLBuilder().notIn('name', [30, 45]).toString()).toBe('name=out=(30,45)');
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
});
