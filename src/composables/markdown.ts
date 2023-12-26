import { watchEffect, shallowRef, computed, toValue } from "vue";
import type { Ref } from "vue";

// type Format = {
//   italic?: boolean;
//   bold?: boolean;
//   undeline?: boolean;
// };
// type Alignment = "center" | "left" | "right";

export function useMarkdown(input: Ref<string>, format: Ref<string[] | null>) {
  const selection = shallowRef<Selection | null>(null);
  const ranges = computed<Range[]>(() =>
    selection.value ? getRangesFromSelection(selection.value) : []
  );
  const rects = computed(() =>
    ranges.value.map((range) => range.getBoundingClientRect())
  );

  const pattern = /[\<>]/g;

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
  let result = shallowRef("")
  watchEffect(() => { 
    
      const formatting = toValue(format);
      
      if (text.value) {
      
      if (formatting?.includes("bold")) {
        console.log(format.value);
        result.value = `<strong>${text.value}</strong>`;
      } else {
        result.value = text.value.replace(pattern, "");
      }
      if (formatting?.includes("italic")) {
        result.value = `<i>${text.value}</i>`;
      } else {
        result.value = text.value.replace(pattern, "");
      }
      if (formatting?.includes("undeline")) {
        result.value = `<u>${text.value}</u>`;
      } else {
        result.value = text.value.replace(pattern, "");
      }

      

     // return result;
    }
    
  });
  console.log(result.value);
  // const formattedInput = computed(() => {
  //   selection.value = null;
  //   if (formatted.value?.length) {
  //     const inputToValue = toValue(input);
  //     return inputToValue.replace(text.value, formatted.value);
  //   }
  //   return "";
  // });

  return { text, rects, selection };
}
