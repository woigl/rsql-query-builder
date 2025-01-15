import { describe, it, expect } from "vitest";
import RSQLBuilderMongoDB from "./RSQLBuilderMongoDB";

describe("RSQLBuilder", () => {
  it("builds a simple query", () => {
    const query = new RSQLBuilderMongoDB().regex("name", "Filip").toString();
    expect(query).toBe('name=regex="Filip"');
  });
});
