import { Platform } from "react-native";
import { polyfillGlobal } from "react-native/Libraries/Utilities/PolyfillFunctions";
import TextEncoder from "react-native-fast-encoder"; // nessesary here for openai to work on native
import { TransformStream } from "web-streams-polyfill"; // nessesary here for vercel-ai-sdk to work on native

if (Platform.OS !== "web") {
  // nessesary here for vercel-ai-sdk on native to work
  // seems that eventsource-parser needs it and a dynamic import will not work,
  // so...how do node_modules, the expo entry point and polyfillGlobal() work together? 🤷
  polyfillGlobal("TransformStream", () => TransformStream);

  const setupDynamicPolyfills = async () => {
    // dynamic imports nessesary for openai to work on web
    // platform test seems not to be enough 🤷
    const { ReadableStream } = await import("web-streams-polyfill");
    const { TextEncoderStream, TextDecoderStream } = await import("@stardazed/streams-text-encoding");
    const { fetch, Headers, Request, Response } = await import("react-native-fetch-api");
    polyfillGlobal("TextDecoder", () => TextEncoder);
    polyfillGlobal("ReadableStream", () => ReadableStream);
    polyfillGlobal("TextEncoderStream", () => TextEncoderStream);
    polyfillGlobal("TextDecoderStream", () => TextDecoderStream);
    polyfillGlobal(
      "fetch",
      () =>
        (...args: any[]) =>
          fetch(args[0], { ...args[1], reactNative: { textStreaming: true } }),
    );
    polyfillGlobal("Headers", () => Headers);
    polyfillGlobal("Request", () => Request);
    polyfillGlobal("Response", () => Response);
  };

  setupDynamicPolyfills();
}

import "expo-router/entry";

declare global {
  interface RequestInit {
    /**
     * @description Polyfilled to enable text ReadableStream for React Native:
     * @link https://github.com/facebook/react-native/issues/27741#issuecomment-2362901032
     */
    reactNative?: {
      textStreaming: boolean;
    };
  }
}
