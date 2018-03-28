export enum GotPrimitiveTypes {
    String = 'string',
    Boolean = 'boolean',
    Number = 'number',
}

export namespace GotPrimitiveTypes {
    export function contains(value: string): boolean {
        if ((Object as any).values(GotPrimitiveTypes).indexOf(value) >= 0) {
            return true;
        } else {
            return false;
        }
    }
}
