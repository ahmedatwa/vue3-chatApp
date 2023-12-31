import { toValue, shallowRef, watchEffect } from "vue";
import type { Ref } from "vue";
import type { TenorGifs } from "@/types/Chat";
import { instance } from "@/axios";

export function useTenor(isTenor: Ref<boolean>, searchTerm: Ref<string>) {
  const apikey = ""; //AIzaSyBiPvrUICvcFDCopwpeFBEu62ocYdX2feE
  const clientkey = "Tenor";
  const lmt = 12;
  const apiURL = shallowRef("https://tenor.googleapis.com/v2/search");
  const data = shallowRef<TenorGifs[] | null>(null);
  const error = shallowRef(null);

  watchEffect(async () => {
    if (isTenor.value) {
      data.value = null;
      error.value = null;

      const termValue = toValue(searchTerm);

      try {
        const response = await instance.get(apiURL.value, {
          params: {
            q: termValue || "exited",
            key: apikey,
            client_key: clientkey,
            limit: lmt,
          },
        });

        data.value = await response.data["results"].map((gif: any) => {
          return {
            name: gif.content_description,
            size: gif.media_formats.gif.size,
            id: gif.id,
            type: "image/gif",
            src: gif.media_formats.gif.url,
          };
        });
      } catch (e: any) {
        error.value = e;
      }
    }
  });

  return { data, error };
}
