import { computed, shallowRef, watchEffect } from "vue";
import { marked } from "marked";
import DOMPurify from "isomorphic-dompurify";

export function useDOMPurify(value: string) {
  const data = shallowRef("");
  const purifiedData = computed(() =>  data.value)
  const DOMPurifySettings = shallowRef({
    ALLOWED_TAGS: ["strong", "ul", "li", "a", "blockquote", "h2", "img"],
    ALLOWED_ATTR: ["href", "target", "src", "height", "width"],
  });

  const renderer = {
    link(href: string, title: string | null | undefined, text: string) {
      return `<a target="blank" href="${href}" title="${title}">${text}</a>`;
    },
  };

  marked.use({ renderer });

  watchEffect(() => {
    data.value = "";
    if (value) {
      data.value = DOMPurify.sanitize(
        marked.parse(value) as string,
        DOMPurifySettings.value
      );
    }
    return data.value
  });

  return { purifiedData };
}
