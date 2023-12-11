import { shallowRef } from "vue";
import type { App } from "vue";
import {
  SupportedLocales,
  Options,
  langKey,
  SetLocale,
  GetLine,
} from "@/types/Symbols.ts";

const defaultLocale = shallowRef("");
const storageLocale = localStorage.getItem("locale");
const supportedLocales = shallowRef<SupportedLocales[]>([]);

const setLocale: SetLocale = (str: string) => {
  defaultLocale.value = str;
  localStorage.setItem("locale", str);
};

const Language = {
  install: (app: App, options: Options) => {
    if (storageLocale) {
      defaultLocale.value = storageLocale;
    } else {
      defaultLocale.value = options.defaultLocale;
    }

    for (let key in options.locales) {
      if (Object.prototype.hasOwnProperty.call(options.locales, key)) {
        const element: { name: string; code: string } = options.locales[key];
        supportedLocales.value.push({ key: element.code, value: element.name });
      }

      if (
        defaultLocale.value === key &&
        Object.keys(options.locales[defaultLocale.value].strings).length === 0
      ) {
        options.locales[key] = options.locales[options.fallbackLocale];
      }
    }

    const getLine: GetLine = (line: string): string => {
      return line.split(".").reduce((o: any, i: string) => {
        if (o) return o[i];
      }, options.locales[defaultLocale.value].strings);
    };

    app.config.globalProperties.$lang = getLine;

    app.provide(langKey, {
      supportedLocales: supportedLocales.value,
      setLocale: setLocale,
      getLine: getLine,
    });
  },
};

export default Language;

declare module "vue" {
  interface ComponentCustomProperties {
    $lang: GetLine;
    supportedLocales: SupportedLocales[];
  }
}


const getObjectValueByPath = (obj: any, path: string, replacement?: any[]): string => {
  // credit: http://stackoverflow.com/questions/6491463/accessing-nested-javascript-objects-with-string-key#comment55278413_6491621
  if (obj == null || !path || typeof path !== 'string') {
    return path;
  }

  if (obj[path] !== undefined) {
    return obj[path];
  }

  path = path.replace(/\[(\w+)\]/g, '.$1'); // convert indexes to properties
  path = path.replace(/^\./, ''); // strip a leading dot
  return getNestedValue(obj, path, replacement);
};

const getNestedValue = (
  obj: object,
  path: string,
  replacement?: any[]
): string => {
  
  const line = path.split(".")

  const result = line.reduce((o: any, i: string) => {
    if (o) return o[i as keyof typeof o];
  }, obj[defaultLocale.value as keyof typeof o].strings);

  if (result === undefined) {
    return line.join('.');
  }

  if (replacement) {
    return format(result, replacement);
  }

  return result;
};

const format = (line: string, args: any[]): string => {
  return line.replace(/{(\d+)}/g, (value, i) => {
    return typeof args[i] != undefined ? args[i] : value;
  });
};