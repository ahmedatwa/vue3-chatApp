import { shallowRef } from "vue";
import { marked } from "marked";
import DOMPurify from "isomorphic-dompurify";

const result = shallowRef("");
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

export const sanitize = (text: string) => {
  result.value = "";
  if (text) {
    result.value = DOMPurify.sanitize(
      marked.parse(text) as string,
      DOMPurifySettings.value
    );
    return result.value;
  }
};
