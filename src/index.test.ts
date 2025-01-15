import { describe, it, expect } from 'vitest';
import { RSQLQueryBuilder } from './index';

describe('RSQLQueryBuilder', () => {
  it('builds a simple query', () => {
    const query = new RSQLQueryBuilder()
      .addCondition('name', '==', 'Filip')
      .build();
    expect(query).toBe('name=="Filip"');
  });
});