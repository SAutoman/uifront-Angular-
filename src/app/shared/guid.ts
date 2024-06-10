export class Guid {
  private constructor(private _val: string) {}

  static get empty(): string {
    return '00000000-0000-0000-0000-000000000000';
  }
  static isGuid(val: any): boolean {
    return val instanceof Guid;
  }
  static isEmpty(val: string | Guid): boolean {
    return !val || val.toString() === Guid.empty;
  }

  static create(val: string | Guid): Guid {
    return new Guid(val.toString());
  }
  static createQuickGuid(): Guid {
    return Guid.create(Guid._createQuickGuid());
  }
  static createQuickGuidAsString(): string {
    return Guid.create(Guid._createQuickGuid()).toString();
  }

  static createGuid(): Guid {
    return Guid.create(Guid._createGuid());
  }
  static createEmptyGuid(): Guid {
    return Guid.create(Guid.empty);
  }

  private static _createQuickGuid(): string {
    return 'c' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }

  private static _createGuid(): string {
    let d = new Date().getTime();
    const uuid = 'cxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      // tslint:disable-next-line:no-bitwise
      const r = (d + Math.random() * 16) % 16 | 0;
      d = Math.floor(d / 16);
      // tslint:disable-next-line:no-bitwise
      return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
    });
    return uuid;
  }
  toString(): string {
    return this._val || '';
  }
}
