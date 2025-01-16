import RSQLBuilderBase, { RSQLBuilderOptions } from "./RSQLBuilderBase";

/** RSQL builder class
 * 
 * This class is used to build RSQL queries.
 *
 * @template TSelector - The type of the selector. It is used to define the field names and is a list of strings.
 */
class RSQLBuilder<TSelector extends string> extends RSQLBuilderBase<TSelector, never> {
    /** Create a new RSQL builder.
     *
     * @param options - The builder options
     * 
     * @returns The builder instance
     * */
    constructor(options: RSQLBuilderOptions<never> = {}) {
        super(options);
    }
}

export default RSQLBuilder;
