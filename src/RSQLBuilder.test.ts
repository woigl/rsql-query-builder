import { describe, it, expect } from 'vitest';
import RSQLBuilder from './RSQLBuilder';

describe('RSQLBuilder', () => {
    it("Test operator Equal ('==')", () => {
        expect(new RSQLBuilder().equal('name', 'Filip').toString()).toBe('name=="Filip"');
    });

    it("Test operator In ('=in=')", () => {
        expect(new RSQLBuilder().in('name', ['Filip', 'John']).toString()).toBe('name=in=("Filip","John")');
    });
});
