import { Text, View, TextInput, Pressable } from "react-native";
import { useChat, useCompletion } from "ai/react";
import { ChangeEvent, useCallback, useState } from "react";

export default function Index() {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <VercelAISDKStreamedWithChat />
      <Hr />
      <VercelAISDKGenerateWithChat />
      <Hr />
      <VercelAISDKGenerateWithCompletion />
      <Hr />
      <OpenAIStreamedResponse />
    </View>
  );
}

function VercelAISDKStreamedWithChat() {
  const { messages, input, handleInputChange, handleSubmit } = useChat({
    api: "/vercel-ai-stream",
    streamProtocol: "text",
  });

  return (
    <View>
      <Text>Stream Chat - Vercel AI SDK | web:❌, ios:❌</Text>
      <Text>Response:</Text>
      {messages.map((m) => (
        <Text key={m.id}>
          <Text>{m.role === "user" && "You: " + m.content}</Text>
          <Text>{m.role === "assistant" && "AI: " + m.content}</Text>
        </Text>
      ))}
      <TextInput
        style={{ borderColor: "gray", borderWidth: 1, marginVertical: 4, padding: 4 }}
        value={input}
        placeholder="Input something..."
        onChange={(e) => handleInputChange(e as unknown as ChangeEvent<HTMLInputElement>)}
      />
      <Pressable onPress={handleSubmit}>
        <Text>Submit</Text>
      </Pressable>
    </View>
  );
}

function VercelAISDKGenerateWithChat() {
  const { messages, input, handleInputChange, handleSubmit } = useChat({
    api: "/vercel-ai-generate",
    streamProtocol: "text",
  });

  return (
    <View>
      <Text>Generate Chat - Vercel AI SDK | web:✅, ios:❌</Text>
      <Text>Response:</Text>
      {messages.map((m) => (
        <Text key={m.id}>
          <Text>{m.role === "user" && "You: " + m.content + "\n"}</Text>
          <Text>
            {m.role === "assistant" &&
              "AI: " + JSON.parse(m.content).messages[0].content[0].text + "\n"}
          </Text>
        </Text>
      ))}
      <TextInput
        style={{ borderColor: "gray", borderWidth: 1, marginVertical: 4, padding: 4 }}
        value={input}
        placeholder="Input something..."
        onChange={(e) => handleInputChange(e as unknown as ChangeEvent<HTMLInputElement>)}
      />
      <Pressable onPress={handleSubmit}>
        <Text>Submit</Text>
      </Pressable>
    </View>
  );
}

function VercelAISDKGenerateWithCompletion() {
  const { completion, input, handleInputChange, handleSubmit } = useCompletion({
    api: "/vercel-ai-generate",
    streamProtocol: "text",
    headers: {
      "X-Is-Completion": "yes",
    },
  });
  return (
    <View>
      <Text>Generate Completion - Vercel AI SDK | web:✅, ios:❌</Text>
      <Text>Response:</Text>
      <Text>{completion}</Text>
      <TextInput
        style={{ borderColor: "gray", borderWidth: 1, marginVertical: 4, padding: 4 }}
        value={input}
        placeholder="Input something..."
        onChange={(e) => handleInputChange(e as unknown as ChangeEvent<HTMLInputElement>)}
      />
      <Pressable onPress={handleSubmit}>
        <Text>Submit</Text>
      </Pressable>
    </View>
  );
}

function OpenAIStreamedResponse() {
  const [response, setResponse] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);

  const handlePress = useCallback(async () => {
    setResponse("");
    setIsStreaming(true);

    const response = await fetch("http://localhost:8081/openai-stream");
    const reader = response.body?.pipeThrough(new TextDecoderStream()).getReader();

    while (true) {
      try {
        const { value, done } = await reader!.read();
        if (done) break;
        setResponse((prev) => prev + value);
      } catch (e) {
        console.error(`Error reading response: ${e}`);
        setIsStreaming(false);
        break;
      } finally {
        setIsStreaming(false);
      }
    }
  }, []);

  return (
    <View>
      <Text>Stream - OpenAI | web:✅, ios:✅</Text>
      <Pressable onPress={handlePress} disabled={isStreaming}>
        <Text>Submit Test</Text>
      </Pressable>
      <Text>Response:</Text>
      <Text>{response}</Text>
    </View>
  );
}

function Hr() {
  return (
    <View
      style={{
        alignSelf: "stretch",
        borderBottomColor: "gray",
        borderBottomWidth: 1,
        marginVertical: 8,
      }}
    ></View>
  );
}
