import React, { useState, useCallback } from "react";
import {
  MainContainer,
  ChatContainer,
  MessageList,
  Message,
  MessageInput,
} from "@chatscope/chat-ui-kit-react";
import "@chatscope/chat-ui-kit-styles/dist/default/styles.min.css";
import "./chat.css";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../redux/store";
import ReactMarkdown from "react-markdown";
import { setSelectedChunk } from "../redux/appSlice";

function parseCitation(href) {
  const regex = /\/source\/\?fileid=([^&]+)&page=(\d+)&from=(\d+)&to=(\d+)/;
  const match = regex.exec(href);

  if (!match) return null;

  return {
    fileId: match[1],
    page: parseInt(match[2], 10),
    lines: {
      from: parseInt(match[3], 10),
      to: parseInt(match[4], 10),
    },
  };
}

function CustomLink({ href, children }) {
  const dispatch = useDispatch();

  if (!href) {
    return <span>{children}</span>;
  }

  const citation = parseCitation(href);

  if (citation) {
    return (
      <button
        type="button"
        onClick={() => dispatch(setSelectedChunk(citation))}
        className="citationRef"
      >
        {children}
      </button>
    );
  }

  return (
    <a href={href} target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  );
}

function transformSources(content) {
  return content.replace(
    /\[(.*?)\]\(source:FileID=([^|]+)\|Page=(\d+)\|Lines=(\d+)-(\d+)\)/g,
    "[$1](/source/?fileid=$2&page=$3&from=$4&to=$5)"
  );
}

const CustomMessageContent = ({ content }) => {
  const components = { a: CustomLink };
  return <ReactMarkdown components={components}>{content}</ReactMarkdown>;
};

const Chat = ({ messages, handleSend }) => {
  const [inputValue, setInputValue] = useState("");
  const sources = useSelector((state) => state.app.sources);
  const fileIds = sources
    .filter(({ selected }) => selected)
    .map(({ fileId }) => fileId);

  const handlePaste = useCallback((event) => {
    event.preventDefault();
    const text = event.clipboardData.getData("text/plain");
    const selection = window.getSelection();
    if (!selection.rangeCount) return;

    const range = selection.getRangeAt(0);
    range.deleteContents();
    range.insertNode(document.createTextNode(text));
    selection.collapseToEnd();

    const editor = document.querySelector(".cs-message-input__content-editor");
    if (editor) {
      editor.dispatchEvent(new Event("input", { bubbles: true }));
    }
  }, []);

  return (
    <div className="chat-container">
      <div className="chat-header">
        <h4>Chat</h4>
      </div>
      <MainContainer>
        <ChatContainer>
          <MessageList>
            {messages.map((msg, index) => (
              <Message
                key={index}
                model={{
                  sentTime: msg.sentTime,
                  sender: msg.sender,
                  direction: msg.direction,
                  type: "custom",
                }}
              >
                <Message.CustomContent>
                  <CustomMessageContent content={msg.message} />
                </Message.CustomContent>
              </Message>
            ))}
          </MessageList>
          <MessageInput
            placeholder="Type message here"
            value={inputValue}
            onChange={setInputValue}
            onSend={(innerHtml, textContent) => {
              handleSend(textContent, fileIds);
              setInputValue("");
            }}
            onPaste={handlePaste}
            attachButton={false}
          />
        </ChatContainer>
      </MainContainer>
    </div>
  );
};

export default Chat;
