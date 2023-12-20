import { watchEffect, shallowRef, computed } from "vue";

type Format = {
  italic?: boolean;
  bold?: boolean;
  undeline?: boolean;
};
type Alignment = "center" | "left" | "right";

export function useMarkdown(
  inputValue: string,
  selectedTxt: string,
  format?: string,
  alignment?: string
) {
  const marked = shallowRef("");
  const classAlignment = shallowRef<Alignment | string>("");
  const classFormat = shallowRef<Format | null>(null);

  watchEffect(() => {
    classAlignment.value = "";
    if (alignment) {
      switch (alignment) {
        case "center":
          classAlignment.value = "text-center";
          break;
        case "left":
          classAlignment.value = "text-left";
          break;
        case "right":
          classAlignment.value = "text-right";
          break;
        default:
          break;
      }
    }
  });

  watchEffect(() => {
    classFormat.value = null;
    if (format) {
      switch (format) {
        case "italic":
          classFormat.value = { italic: true };
          break;
        case "bold":
          classFormat.value = { bold: true };
          break;
        case "undeline":
          classFormat.value = { undeline: true };
          break;
        default:
          break;
      }
    }
  });

  const formats = computed(() => {
    return {
      "font-weight-bold": classFormat.value?.bold ? true : false,
      "font-italic": classFormat.value?.italic ? true : false,
      "text-decoration-underline": classFormat.value?.undeline ? true : false,
    };
  });

  if(classAlignment.value) {
    marked.value += `<span :class="${classAlignment.value}">${selectedTxt}</span>`;
  } else if (formats.value) {
    marked.value += `<span :class="${formats.value}">${selectedTxt}</span>`;
  }

  const markedTextResult = computed(() => {    
    return inputValue.replace(selectedTxt, marked.value);
  });
  
  return { markedTextResult };
}
