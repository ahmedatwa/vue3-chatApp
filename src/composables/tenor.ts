import { watchEffect, toValue, shallowRef } from "vue";
import type { Ref } from "vue";
import type { TenorGifs } from "@/types/Chat";

export function useTenor(searchTerm: Ref<string>) {
  const result = shallowRef<TenorGifs[] | null>(null);
  const apikey = "AIzaSyBiPvrUICvcFDCopwpeFBEu62ocYdX2feE";
  const clientkey = "Tenor";
  const lmt = 21;
  const apiURL = shallowRef("https://tenor.googleapis.com/v2/search?q=");

  // url Async requesting function
  const httpGetAsync = (theUrl: string, callback: Function) => {
    // create the request object
    var xmlHttp = new XMLHttpRequest();

    // set the state change callback to capture when the response comes in
    xmlHttp.onreadystatechange = function () {
      if (xmlHttp.readyState == 4 && xmlHttp.status == 200) {
        callback(xmlHttp.responseText);
      }
    };

    // open as a GET call, pass in the url and set async = True
    xmlHttp.open("GET", theUrl, true);

    // call send with no params as they were passed in on the url string
    xmlHttp.send(null);

    return;
  };

  // callback for the top 8 GIFs of search
  const tenorCallback_search = (responsetext: any) => {
    // Parse the JSON response
    const response_objects = JSON.parse(responsetext);
    // load the GIFs -- for our example we will load the first GIFs preview size (nanogif) and share size (gif)
    result.value = response_objects["results"].map((gif: any) => {      
      return {
        name: gif.content_description,
        size: gif.media_formats.gif.size,
        id: gif.id,
        type: 'image/gif',
        src: gif.media_formats.gif.url,
      };
    });

    return;
  };

  watchEffect(() => {
    result.value = null;
    const termValue = toValue(searchTerm);
    const term = termValue !== "" ? termValue : "exited"

    const url = `${apiURL.value}${term}&key=${apikey}&client_key=${clientkey}&limit=${lmt}`;

    httpGetAsync(url, tenorCallback_search);
  });

  return { result };
}
