import { shallowRef } from "vue";
import type { App } from "vue";
import {
  Locales,
  Options,
  langKey,
  SetLocale,
  Translate,
} from "@/types/Symbols.ts";

const defaultLocale = shallowRef("en");
const storageLocale = localStorage.getItem("locale");
const locales = shallowRef<Locales[]>([]);

const setLocale: SetLocale = (str: string) => {
  defaultLocale.value = str;
  localStorage.setItem("locale", str);
};

const format = (line: string, args: any[]): string => {
  return line.replace(/{(\d+)}/g, (value, i) => {
    return typeof args[i] != undefined ? args[i] : value;
  });
};

const getObjectValueByPath = (
  obj: any,
  path: string,
  replacement?: any[]
): string => {
  // credit: http://stackoverflow.com/questions/6491463/accessing-nested-javascript-objects-with-string-key#comment55278413_6491621
  if (obj == null || !path || typeof path !== "string") return path;
  if (obj[path] !== undefined) {
    return replacement ? format(obj[path], replacement) : obj[path];
  }
  path = path.replace(/\[(\w+)\]/g, ".$1"); // convert indexes to properties
  path = path.replace(/^\./, ""); // strip a leading dot
  return getNestedValue(obj, path, replacement);
};

const getNestedValue = (
  obj: object,
  path: string,
  replacement?: any[]
): string => {
  const result = path.split(".").reduce((o: any, i: string): string | undefined => {
    if (o) return o[i as keyof typeof o];
  }, obj);

  if (result === undefined) {
    return path;
  }

  if (replacement) {
    return format(result, replacement);
  }

  return result;
};

const l = {
  install: (app: App, options: Options) => {
    if (storageLocale) {
      defaultLocale.value = storageLocale;
    } else {
      defaultLocale.value = options.defaultLocale;
    }

    for (let key in options.locales) {
      if (Object.prototype.hasOwnProperty.call(options.locales, key)) {
        const element: { name: string; code: string } = options.locales[key];
        locales.value.push({ key: element.code, value: element.name });
      }

      if (
        defaultLocale.value === key &&
        Object.keys(options.locales[defaultLocale.value].strings).length === 0
      ) {
        options.locales[key] = options.locales[options.fallbackLocale];
      }
    }

    const translate: Translate = (line: string, replacement?: any[]): string => {
      return getObjectValueByPath(
        options.locales[defaultLocale.value].strings,
        line,
        replacement
      );
    };

    app.config.globalProperties.$lang = translate;

    app.provide(langKey, {
      locales: locales.value,
      setLocale: setLocale,
      getLine: translate,
    });
  },
};

export default l;

declare module "vue" {
  interface ComponentCustomProperties {
    $lang: Translate;
  }
}
