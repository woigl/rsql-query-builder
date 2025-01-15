export class RSQLQueryBuilder {
    private queryParts: string[] = [];
  
    addCondition(key: string, operator: string, value: string): this {
      this.queryParts.push(`${key}${operator}"${value}"`);
      return this;
    }
  
    build(): string {
      return this.queryParts.join(';');
    }
  }