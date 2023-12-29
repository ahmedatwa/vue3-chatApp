import { watchEffect, shallowRef, computed, toValue } from "vue";
import type { Ref } from "vue";

// type Format = {
//   italic: boolean;
//   bold: boolean;
//   undeline: boolean;
// };
// type Alignment = "center" | "left" | "right";

export function useMarkdown(
  input: Ref<string>,
  format: Ref<{ key: string; value: boolean } | null>
) {
  // const formats = shallowRef<{
  //   key: string;
  //   value: boolean;
  // } | null>(null);
  const selection = shallowRef<Selection | null>(null);

  const ranges = computed<Range[]>(() =>
    selection.value ? getRangesFromSelection(selection.value) : []
  );

  const rects = computed(() =>
    ranges.value.map((range) => range.getBoundingClientRect())
  );

   const pattern = /<\/?strong>/g;

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
    if(window) selection.value = window.getSelection();
  }

  if (window) {
    window.document.addEventListener("selectionchange", onSelectionChange);
  }

  const text = computed(() => selection.value?.toString() ?? "");

  const result = computed(() => {
    if(markedText.value)
   return input.value.replace(text.value, markedText.value)
  });

  const markedText = shallowRef("")

  const markedResult = (key: string, value: boolean) => {

    if (value) {
          markedText.value = text.value.replace(text.value, `<${key}>${text.value}</${key}>`);
        } else {
          markedText.value =  markedText.value.replace(new RegExp(`(<\/?${key}>)`, 'ig'), "");
        }    
        
        console.log(markedText.value);
        
        return markedText.value
  };

  watchEffect(() => {
    if (format.value) {
      const style = toValue(format)
      if(style)
      markedResult(style.key, style.value);
    }
  });

  return { text, rects, selection, result, markedText };
}
