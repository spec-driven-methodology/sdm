export class SdmError extends Error {
    code;
    constructor(code, message) {
        super(message);
        this.name = "SdmError";
        this.code = code;
    }
}
//# sourceMappingURL=errors.js.map