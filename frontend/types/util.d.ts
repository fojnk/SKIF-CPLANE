/* eslint-disable @typescript-eslint/no-explicit-any */
type ValueOf<T> = T[keyof T];

type ExtractEnumKeys<T> = ValueOf<{
  [key in keyof T]: key extends string ? key : never;
}>;

type Maybe<T> = Nullable<T> | undefined;

type Nullable<T> = T | null;

type AnyObject = Record<string, any>;

type EmptyObject = {
  [key in string]: never;
};

type AnyPrimitive = string | number | boolean | null | undefined;

type AnyFunction = (...args: any) => any;

type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (
  k: infer I,
) => void
  ? I
  : never;

type MaybeFalsy<T> = Maybe<T> | '' | false | 0;

type MaybeKeys<T> = {
  [K in keyof T]: Maybe<T[K]>;
};
