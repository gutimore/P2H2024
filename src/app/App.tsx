"use client";

import { useState } from "react";
import axios from "axios";
import "./App.css";
import Chat from "./components/Chat";
import SidePanel from "./components/SidePanel";
import { v4 as uuidv4 } from "uuid";
import clsx from "clsx";
import Reader from "./components/Reader";
import { Provider } from "react-redux";
import store from "./redux/store";
const initialMessages = [
  {
    id: uuidv4(), // Assign a UUID here
    message: "Hello! How can I assist you today?",
    sentTime: "just now",
    sender: "Assistant",
    direction: "incoming",
  },
];

export default function App() {
  const [messages, setMessages] = useState(initialMessages);
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async (innerHtml: string, fileIds: string[]) => {
    const newMessage = {
      id: uuidv4(), // Assign a UUID here
      message: innerHtml,
      sentTime: "just now",
      sender: "You",
      direction: "outgoing",
    };

    // Update messages to include user's new message
    setMessages((prevMessages) => [...prevMessages, newMessage]);

    // Call OpenAI API
    setIsLoading(true);
    try {
      const response = await axios.post(
        "/api/chat",
        {
          messages: [
            { role: "system", content: "You are a helpful assistant." },
            ...messages.map((msg) => ({
              role: msg.sender === "You" ? "user" : "assistant",
              content: msg.message,
            })),
            { role: "user", content: innerHtml },
          ],
          fileIds,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const assistantMessage = {
        id: uuidv4(), // Assign a UUID here
        message: response.data.message,
        sentTime: "just now",
        sender: "Assistant",
        direction: "incoming",
      };

      // Update messages to include assistant's new message
      setMessages((prevMessages) => [...prevMessages, assistantMessage]);
    } catch (error) {
      console.error("Error fetching OpenAI response:", error);
      // Optionally add an error message to the chat
      const errorMessage = {
        id: uuidv4(), // Assign a UUID here
        message: "Sorry, I couldn't get a response. Please try again later.",
        sentTime: "just now",
        sender: "Assistant",
        direction: "incoming",
      };
      setMessages((prevMessages) => [...prevMessages, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Provider store={store}>
      <div className={clsx("App", "dark-theme")}>
        <SidePanel />
        <Chat
          messages={messages}
          handleSend={handleSend}
          isLoading={isLoading}
        />
        <Reader />
      </div>
    </Provider>
  );
}
