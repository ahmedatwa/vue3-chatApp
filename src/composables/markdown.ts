import { watchEffect, shallowRef, computed, toValue } from "vue";
import type { Ref } from "vue";

type Format = {
  italic?: boolean;
  bold?: boolean;
  undeline?: boolean;
};
type Alignment = "center" | "left" | "right";

export function useMarkdown(input: Ref<string>, format: Ref<string[] | null>) {
  const selection = shallowRef<Selection | null>(null);
  const ranges = computed<Range[]>(() =>
    selection.value ? getRangesFromSelection(selection.value) : []
  );
  const rects = computed(() =>
    ranges.value.map((range) => range.getBoundingClientRect())
  );

  const pattern = /[\<>]/g;

  const data = shallowRef("");

  // - unordered list
  // **text** bold
  // [text](link)
  // ---- h2
  // > blockquote

  function getRangesFromSelection(selection: Selection) {
    const rangeCount = selection.rangeCount ?? 0;
    return Array.from({ length: rangeCount }, (_, i) =>
      selection.getRangeAt(i)
    );
  }

  function onSelectionChange() {
    selection.value = null; // trigger computed update
    if (window) selection.value = window.getSelection();
  }

  if (window) {
    window.document.addEventListener("selectionchange", onSelectionChange);
  }

  const text = computed(() => selection.value?.toString() ?? "");

  const formatted = computed(() => {
    if (format) {
      const formatting = toValue(format);
      let result = ""
      if (formatting?.includes("bold"))  {
        result = `<strong>${text.value}</strong>`;
      } else {
        result = text.value.replace(pattern, "");
      }
      if (formatting?.includes("italic"))  {
        result = `<i>${text.value}</i>`;
      } else {
        result = text.value.replace(pattern, "");
      }
      if (formatting?.includes("undeline"))  {
        result = `<u>${text.value}</u>`;
      } else {
        result = text.value.replace(pattern, "");
      }

      
      return result;
     
       
    }
  })

  const formattedInput = computed(() => {
    if (formatted.value) {
      const inputToValue = toValue(input)
      return inputToValue.replace(text.value, formatted.value);
    }
    return "";
  });

  return { text, rects, formatted, selection, formattedInput };
}
