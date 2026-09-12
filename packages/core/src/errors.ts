export class SdmError extends Error {
  readonly code: string;

  constructor(code: string, message: string) {
    super(message);
    this.name = "SdmError";
    this.code = code;
  }
}
