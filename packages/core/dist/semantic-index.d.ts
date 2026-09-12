export declare const SEMANTIC_INDEX_SCHEMA = "sdm.semantic-index/v1";
export interface IndexedDocument {
    id: string;
    kind: "skill" | "question";
    text: string;
}
export interface SemanticIndex {
    schemaVersion: typeof SEMANTIC_INDEX_SCHEMA;
    documents: IndexedDocument[];
}
export interface SearchHit extends IndexedDocument {
    score: number;
}
export declare function semanticSimilarity(left: string, right: string): number;
export declare function semanticIndexPath(projectRoot: string): string;
export declare function rebuildSemanticIndex(startDir: string): {
    projectRoot: string;
    index: SemanticIndex;
};
export declare function searchSemanticIndex(startDir: string, query: string, kind?: IndexedDocument["kind"]): {
    projectRoot: string;
    hits: SearchHit[];
};
//# sourceMappingURL=semantic-index.d.ts.map