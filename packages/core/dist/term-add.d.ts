import { type Term, type TermKind } from "./schemas.js";
export interface AddTermInput {
    id: string;
    term: string;
    definition: string;
    aliases?: string[];
    skills?: string[];
    kind?: TermKind;
    force?: boolean;
}
export interface AddTermResult {
    term: Term;
    path: string;
}
export declare function addTerm(projectRoot: string, input: AddTermInput): AddTermResult;
//# sourceMappingURL=term-add.d.ts.map