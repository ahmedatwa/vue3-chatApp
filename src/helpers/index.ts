import { ref, shallowRef, toValue } from "vue";
import { nanoid } from "nanoid";
// regex expression to match all
// non-alphanumeric characters in string
const NoneAlphaNumeric = shallowRef(/[^A-Za-z0-9]/g);


/**
 *
 * @param text
 * @param char
 * @returns
 */
const capitalize = (str: string, omitDelim: boolean = true) => {
  if (str === undefined) {
    return str;
  }

  let char = str.match(NoneAlphaNumeric.value)
    ? str.match(NoneAlphaNumeric.value)
    : " ";
  const result = str
    .split(char ? char[0] : " ")
    .map(
      (word) => word.charAt(0).toUpperCase() + word.substring(1).toLowerCase()
    );

  let text = omitDelim ? result.join(" ") : result.join(char ? char[0] : " ");
  return text.trim();
};

/**
 *
 * @param text
 * @param char
 * @returns string
 */
const snakeCase = (text: string) => {
  let words = text.split(" ");
  return words.reduce((accumlator, word, index) => {
    return accumlator + (index ? "_" : "") + word.toLowerCase();
  });
};

// Dates

const useNow = (): string => {
  return Date.now().toString();
};
// YYYY-MM-DD HH:mm:ss
const formatDate = (text?: string | number | null, full: boolean = false) => {
  const date = text ? new Date(text) : new Date();
  if (full) {
    return new Intl.DateTimeFormat("en", {
      year: "numeric",
      month: "long",
      day: "2-digit",
      weekday: "long",
    }).format(date);
  }

  const result = new Intl.DateTimeFormat("en", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(date);

  return result.replace(/\//g, "-");
};

const createDateTime = (
  date?: string | number,
  format: string = "YYYY-MM-DD HH:mm:ss"
) => {
  const x = date ? new Date(date) : new Date();
  const d = {
    M: x.getMonth() + 1,
    d: x.getDate(),
    D: x.getDate(),
    h: x.getHours(),
    H: x.getHours(),
    m: x.getMinutes(),
    s: x.getSeconds(),
  };
  format = format.replace(/(M+|d+|D+|h+|H+|m+|s+)/g, (v) => {
    return ((v.length > 1 ? "0" : "") + d[v.slice(-1) as keyof typeof d]).slice(
      -2
    );
  });

  return format.replace(/(Y+)/g, (v) => {
    return x.getFullYear().toString().slice(-v.length);
  });
};

const formatTimeShort = (time: string) => {
  const t = time ? new Date(time) : Date.now();
  return new Intl.DateTimeFormat("en", {
    timeStyle: "short",
  }).format(t);
};
/**
 *
 * @param timestamp
 * @returns
 */
const createFromTimestamp = (timestamp: string) => {
  return new Date(Number(timestamp) * 1000)
    .toISOString()
    .slice(0, 19)
    .replace("T", " ");
};

/**
 * @category Object
 * @param {Object} object The object to inspect.
 * @param {Function} predicate The function invoked per iteration.
 * @returns {string|undefined} Returns the key of the matched element,
 *  else `undefined`.
 */
const findKey = (object: object, predicate: Function): string | undefined => {
  if (object == null) {
    return undefined;
  }

  const objectToValue = toValue(object);
  const keys = Object.keys(objectToValue);

  for (let i = 0, { length } = keys; i < length; i += 1) {
    const key = keys[i];
    const value = objectToValue[key as keyof typeof object];
    if (predicate(value, key, objectToValue)) {
      return key;
    }
  }
  return undefined;

  // for (const [key, obj] of Object.entries(objectToValue)) {
  //   const keys = Object.keys(obj);
  //   const found = keys.find((key) => {
  //     return obj[key] === needle;
  //   });

  //   if (found) return key
  // }
};

const remove = (object: object[], needle: string[]) => {
  if (object == null) {
    return undefined;
  }

  const objectToValue = toValue(object);
  const index = objectToValue.findIndex((key) => {
    return key[needle[0] as keyof typeof key] === needle[1];
  });
  return objectToValue.splice(index, 1);
};
/**
 *
 * @param s
 * @param forAttribute
 * @returns
 */

/** Used to match HTML entities and HTML characters. */
const reUnescapedHtml = /[&<>"']/g;
// html escape map
/** Used to map characters to HTML entities. */
const htmlEscapes = shallowRef({
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
});
const reHasUnescapedHtml = RegExp(reUnescapedHtml.source);
const esc = (string: string) => {
  return string && reHasUnescapedHtml.test(string)
      ? string.replace(
          reUnescapedHtml,
          (chr) => htmlEscapes.value[chr as keyof typeof htmlEscapes.value]
        )
      : string || "";
  // result.replace("\n", "");
};

function isUndefined(value: any) {
  return value === undefined;
}

const isNull = (value: any) => {
  return value === null;
};

/**
 *
 * @param value
 * @returns
 */
const isEmpty = (value: any): boolean => {
  if (value == null) {
    return true;
  }

  if (
    Array.isArray(value) ||
    typeof value === "string" ||
    typeof value === "function" ||
    Buffer.isBuffer(value)
  ) {
    return !value.length;
  }

  const tag = value.tagName;
  if (tag === "[object Map]" || tag === "[object Set]") {
    return !value.size;
  }
  if (value.prototype) {
    return !Object.keys(value).length;
  }
  for (const key in value) {
    if (Object.hasOwnProperty.call(value, key)) {
      return false;
    }
  }
  return true;
};

const stripQuotes = (str: string) => {
  return str.replace(/[\"\']/g, "");
};

/**
 *
 * @param text
 */
const writeClipboard = (text: string) => {
  if (text) navigator.clipboard.writeText(text);
};

/**
 *
 * @param array
 * @param key
 * @returns
 */
const arrayUniqueBy = (array: any[], key: string | number) => {
  if (key) return [...new Map(array.map((item) => [item[key], item])).values()];
};

const bytesToMegabytes = (bytes: number) => {
  return (bytes / (1024 * 1024)).toFixed(2) + " MB";
};

// const findInArray = (data: object[], needle: number | string) => {
//   const dataToValue = toValue(data);
//   for (const [key, obj] of Object.entries(dataToValue)) {
//     const keys = Object.keys(obj);
//     const found = keys.find((key) => {
//       return obj[key] === needle;
//     });

//     if (found) return key ? Number(key) : key;
//   }
// };

/**
 *
 * @param value
 * @returns
 * credit: @https://lodash.com/docs/4.17.15#toNumber
 */
const toNumber = (value: any) => {
  /** Used as references for various `Number` constants. */
  const NAN = 0 / 0;
  /** Used to match leading and trailing whitespace. */
  const reTrim = /^\s+|\s+$/g;
  /** Used to detect bad signed hexadecimal string values. */
  const reIsBadHex = /^[-+]0x[0-9a-f]+$/i;
  /** Used to detect binary string values. */
  const reIsBinary = /^0b[01]+$/i;
  /** Used to detect octal string values. */
  const reIsOctal = /^0o[0-7]+$/i;

  if (typeof value === "number") {
    return value;
  }
  if (typeof value === "symbol") {
    return NAN;
  }
  if (typeof value === "object") {
    const other = typeof value.valueOf === "function" ? value.valueOf() : value;
    value = typeof other === "object" ? `${other}` : other;
  }
  if (typeof value !== "string") {
    return value === 0 ? value : +value;
  }

  value = value.replace(reTrim, "");
  const isBinary = reIsBinary.test(value);
  return isBinary || reIsOctal.test(value)
    ? parseInt(value.slice(2), isBinary ? 2 : 8)
    : reIsBadHex.test(value)
    ? NAN
    : +value;
};

const formatDateLong = (text: string | number) => {
  const date = new Date(text);
  const today = new Date();
  // (Sunday) / current Week
  const firstDay = new Date(today.setDate(today.getDate() - today.getDay()));
  // (Saturday) / / current Week
  const lastDay = new Date(today.setDate(today.getDate() - today.getDay() + 6));

  const weekday = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  //check if my value is between a minimum date and a maximum date
  if (date >= firstDay && date <= lastDay) {
    return `${
      weekday[date.getDay()]
    }, ${date.getDate()}-${date.getMonth()}-${date.getFullYear()}`;
  }
  return new Intl.DateTimeFormat("en", {
    year: "numeric",
    month: "long",
    day: "2-digit",
    weekday: "long",
  }).format(date);
};

const getRandom = (len: number = 36) => {
  return nanoid(len);
};

export {
  capitalize,
  snakeCase,
  formatDate,
  createFromTimestamp,
  remove,
  esc,
  findKey,
  isUndefined,
  isNull,
  isEmpty,
  stripQuotes,
  writeClipboard,
  formatTimeShort,
  arrayUniqueBy,
  bytesToMegabytes,
  useNow,
  createDateTime,
  toNumber,
  formatDateLong,
  getRandom,
};
