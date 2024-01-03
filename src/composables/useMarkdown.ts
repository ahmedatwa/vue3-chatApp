import { shallowRef, computed, toValue } from "vue";
import type { Ref } from "vue";

export function useMarkdown(selector: Ref, input: Ref<string>) {
  const selected = shallowRef<string | null>(null);
  const text = shallowRef<string | null>(null);

  const markedText = computed(() => {
    if (selected.value && text.value) {
      return input.value.replace(text.value, selected.value);
    }
  });

  const appleStyleTag = (tag: string, value: boolean) => {
    if (selected.value)
      if (value) {
        if (!selected.value?.match(`<${tag}>`)) {
          selected.value = `<${tag}> ${selected.value} </${tag}>`;
        }
      } else {
        const regex = new RegExp(`<\/?${tag}>`, "gi");
        selected.value = selected.value?.replace(regex, "");
      }
  };

  const appleListStyle = () => {
    if (selected.value)
      if (!selected.value?.match("ul")) {
        selected.value =
          "<ul class='ms-4'><li>" + selected.value + "</li></ul>";
      } else {
        const regex = new RegExp(`<\/?ul>`, "gi");
        const regexLi = new RegExp(`<\/?li>`, "gi");
        selected.value = selected.value.replace(regex, "").replace(regexLi, "");
      }
  };

  const applyLink = (href: string) => {
    if (selected.value)
      if (!selected.value?.match("<a")) {
        selected.value = `<a href="${href}" target="_blank">${selected.value}</a>`;
      } else {
        const regex = new RegExp(`<\/?a>`, "gi");
        selected.value = selected.value.replace(regex, "");
      }
  };

  const getSelected = () => {
    selected.value = null;
    text.value = null;
    const selectorToValue = toValue(selector);
    const start = selectorToValue.selectionStart;
    const finish = selectorToValue.selectionEnd;
    selected.value = selectorToValue.value.substring(start, finish);
    text.value = selectorToValue.value.substring(start, finish);
  };

  const clearFormatting = () => {
    return (selected.value = text.value);
  };

  return {
    markedText,
    selected,
    getSelected,
    appleStyleTag,
    appleListStyle,
    applyLink,
    clearFormatting,
  };
}
