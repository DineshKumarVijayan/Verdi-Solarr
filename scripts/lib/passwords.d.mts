export function hashPassword(password: string): Promise<string>;
export function normaliseMobile(v: string): string | null;
export function sqlString(v: string | null): string;
export function runD1(sql: string, remote?: boolean, quiet?: boolean): Promise<void>;
