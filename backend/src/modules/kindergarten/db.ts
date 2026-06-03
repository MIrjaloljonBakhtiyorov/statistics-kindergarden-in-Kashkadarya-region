import sharedDb from '../shared/database.js';

type DbCallback<T = any> = (err: Error | null, value: T) => void;
type RunCallback = (this: { lastID?: number; changes?: number }, err: Error | null) => void;

type PreparedStatement = {
  run(params?: any[] | RunCallback, callback?: RunCallback): void;
  finalize(callback?: (err: Error | null) => void): void;
};

export type DatabaseAdapter = {
  dialect?: 'postgres';
  serialize(fn: () => void): void;
  run(sql: string, callback?: RunCallback): void;
  run(sql: string, params: any[], callback?: RunCallback): void;
  all<T = any>(sql: string, callback: DbCallback<T[]>): void;
  all<T = any>(sql: string, params: any[], callback: DbCallback<T[]>): void;
  get<T = any>(sql: string, callback: DbCallback<T | undefined>): void;
  get<T = any>(sql: string, params: any[], callback: DbCallback<T | undefined>): void;
  prepare(sql: string): PreparedStatement;
};

export const db = sharedDb as DatabaseAdapter;
