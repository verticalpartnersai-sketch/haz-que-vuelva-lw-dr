export interface IdentifierGenerator {
  next(): string;
}

export class CryptoIdentifierGenerator implements IdentifierGenerator {
  next() {
    return crypto.randomUUID();
  }
}
