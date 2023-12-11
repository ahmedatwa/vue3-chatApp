import { InjectionKey } from "vue";

export interface Locales {
  key: string;
  value: string;
}

type OptionsLocale = {
  [key: string]: { name: string; code: string; strings: object };
};

export interface Options {
  defaultLocale: string;
  fallbackLocale: string;
  locales: OptionsLocale;
}

export type Translate = (line: string, replacement?: any[]) => string;
export type SetLocale = (key: string) => void;

export const supportedLocales: InjectionKey<Locales[]> = Symbol("locales");

interface Lang {
  locales: Locales[];
  setLocale: SetLocale;
  getLine: Translate;
}

export const langKey: InjectionKey<Lang> = Symbol("Lang");

