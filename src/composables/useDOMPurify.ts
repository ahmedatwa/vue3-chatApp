import { shallowRef } from "vue";
import { marked } from "marked";
import DOMPurify from "isomorphic-dompurify";

const DOMPurifySettings = shallowRef({
  ALLOWED_TAGS: ["strong", "ul", "li", "a", "blockquote", "h2", "img", "u", "i", "pre"],
  ALLOWED_ATTR: ["href", "target", "src", "height", "width", "class"],
});

const renderer = {
  link(href: string, title: string | null | undefined, text: string) {
    return `<a target="blank" href="${href}" title="${title}">${text}</a>`;
  },
};

marked.use({ renderer });

export const sanitize = (value: string) => {  
  return DOMPurify.sanitize(marked.parse(value) as string,
    DOMPurifySettings.value
  );
};
