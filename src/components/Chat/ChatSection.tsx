import { Conversation, Message, SourceDocument } from "@/types/chat";
import { KeyValuePair } from "@/types/data";
import { ErrorMessage } from "@/types/error";
import { OpenAIModel, OpenAIModelID } from "@/types/openai";
import { IconArrowDown, IconClearAll, IconSettings } from "@tabler/icons-react";
import {
  FC,
  memo,
  MutableRefObject,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { ErrorMessageDiv } from "./ErrorMessageDiv";
import { throttle } from "@/utils/app/throttle";
import { Spinner } from "../Spinner";
import { ChatLoader } from "./ChatLoader";
import { ChatMessage } from "./ChatMessage";
import { ChatInput } from "./ChatInput";
import { ModelSelect } from "./ModelSelect";
import { PineconeSetting } from "./PineconeSettings";
import { PineConeEnv, PineconeStats } from "@/types/pinecone";

interface Props {
  conversation: Conversation;
  models: OpenAIModel[];
  pineconeStats: PineconeStats | null;
  pineconeError:ErrorMessage | null;
  apiKey: string;
  pineconeEnv: PineConeEnv;
  onPineconeEnvChange: (pinecone: PineConeEnv) => void;
  serverSideApiKeyIsSet: boolean;
  defaultModelId: OpenAIModelID;
  messageIsStreaming: boolean;
  modelError: ErrorMessage | null;
  loading: boolean;
  onSend: (message: Message,  deleteCount?: number) => void;
  onUpdateConversation: (
    conversation: Conversation,
    data: KeyValuePair
  ) => void;
  onEditMessage: (message: Message, messageIndex: number) => void;
  stopConversationRef: MutableRefObject<boolean>;
}

export const ChatSection: FC<Props> = memo(
  ({
    conversation,
    models,
    pineconeStats,
    apiKey,
    serverSideApiKeyIsSet,
    pineconeEnv,
    onPineconeEnvChange,
    defaultModelId,
    messageIsStreaming,
    pineconeError,
    modelError,
    loading,
    onSend,
    onUpdateConversation,
    onEditMessage,
    stopConversationRef,
  }) => {
    const [currentMessage, setCurrentMessage] = useState<Message>();
    const [autoScrollEnabled, setAutoScrollEnabled] = useState<boolean>(true);
    const [showSettings, setShowSettings] = useState<boolean>(false);
    const [showScrollDownButton, setShowScrollDownButton] =
      useState<boolean>(false);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const chatContainerRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);


    const scrollToBottom = useCallback(() => {
      if (autoScrollEnabled) {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        textareaRef.current?.focus();
      }
    }, [autoScrollEnabled]);

    const handleScroll = () => {
      if (chatContainerRef.current) {
        const { scrollTop, scrollHeight, clientHeight } =
          chatContainerRef.current;
        const bottomTolerance = 30;

        if (scrollTop + clientHeight < scrollHeight - bottomTolerance) {
          setAutoScrollEnabled(false);
          setShowScrollDownButton(true);
        } else {
          setAutoScrollEnabled(true);
          setShowScrollDownButton(false);
        }
      }
    };

    const handleScrollDown = () => {
      chatContainerRef.current?.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: "smooth",
      });
    };

    const handleSettings = () => {
      setShowSettings(!showSettings);
    };

    const onClearAll = () => {
      if (confirm("Are you sure you want to clear all messages?")) {
        onUpdateConversation(conversation, { key: "messages", value: [] });
      }
    };

    const scrollDown = () => {
      if (autoScrollEnabled) {
        messagesEndRef.current?.scrollIntoView(true);
      }
    };
    const throttledScrollDown = throttle(scrollDown, 250);


    // appear scroll down button only when user scrolls up

    useEffect(() => {
      throttledScrollDown();
      setCurrentMessage(
        conversation.messages[conversation.messages.length - 2]
      );
    }, [conversation.messages, throttledScrollDown]);

    useEffect(() => {
      const observer = new IntersectionObserver(
        ([entry]) => {
          setAutoScrollEnabled(entry.isIntersecting);
          if (entry.isIntersecting) {
            textareaRef.current?.focus();
          }
        },
        {
          root: null,
          threshold: 0.5,
        }
      );
      const messagesEndElement = messagesEndRef.current;
      if (messagesEndElement) {
        observer.observe(messagesEndElement);
      }
      return () => {
        if (messagesEndElement) {
          observer.unobserve(messagesEndElement);
        }
      };
    }, [messagesEndRef]);


    return (
      <div className="relative flex-1 overflow-hidden bg-white dark:bg-[#343541]">
        {!(apiKey || serverSideApiKeyIsSet) ? (
          <div className="mx-auto flex h-full w-[300px] flex-col justify-center space-y-6 sm:w-[600px]">
            <div className="text-4xl font-bold text-center text-black dark:text-white">
              Chat With Your Documents
            </div>

            <div className="text-center text-gray-500 dark:text-gray-400">
              <div className="mb-2">
                Chatbot UI allows you to plug in your API key to use this UI
                with their API.
              </div>
              <div className="mb-2">
                It is <span className="italic">only</span> used to communicate
                with their API.
              </div>
              <div className="mb-2">
                Please set your OpenAI API key in the bottom left of the
                sidebar.
              </div>
              <div>
                If you don&apos;t have an OpenAI API key, you can get one here:
                <a
                  href="https://platform.openai.com/account/api-keys"
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-500 hover:underline"
                >
                  openai.com
                </a>
              </div>
            </div>
          </div>
        ) : modelError ? (
          <ErrorMessageDiv error={modelError} />
        ) : (
          <>
            {!pineconeEnv.apikey ? (
              <div className="mx-auto flex h-full w-[350px] flex-col justify-center space-y-6 sm:w-[600px] px-2">
                <PineconeSetting
                  pineconeEnv={pineconeEnv}
                  pineconeStats={pineconeStats}
                  pineconeError={pineconeError}
                  onPineconeEnvChange={onPineconeEnvChange}
                />
                <div className="text-center text-gray-500 dark:text-gray-400">
                  <div className="mb-2">
                    The Pinecone vector database makes it easy to build
                    high-performance vector search applications.
                  </div>
                  <div className="mb-2">
                    Please set your PineCone API key, Environment Name and Index
                    Name.
                  </div>
                  <div>
                    If you don&apos;t have an PineCone Account, you can register
                    one here:
                    <a
                      href="https://login.pinecone.io/"
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-500 hover:underline"
                    >
                      pinecone.io
                    </a>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <div
                  className="max-h-full overflow-x-hidden"
                  ref={chatContainerRef}
                  onScroll={handleScroll}
                >
                  {conversation.messages.length === 0 ? (
                    <>
                      <div className="mx-auto flex w-[350px] flex-col space-y-10 pt-12 sm:w-[600px]">
                        <div className="text-3xl font-semibold text-center text-gray-800 dark:text-gray-100">
                          {models.length === 0 ? (
                            <div>
                              <Spinner size="16px" className="mx-auto" />
                            </div>
                          ) : (
                            "Chatbot UI"
                          )}
                        </div>

                        {models.length > 0 && (
                          <div className="flex flex-col h-full p-4 space-y-4 border rounded-lg border-neutral-200 dark:border-neutral-600">
                            <ModelSelect
                              model={conversation.model}
                              models={models}
                              defaultModelId={defaultModelId}
                              onModelChange={(model) =>
                                onUpdateConversation(conversation, {
                                  key: "model",
                                  value: model,
                                })
                              }
                            />
                            <PineconeSetting
                              pineconeEnv={pineconeEnv}
                              pineconeStats={pineconeStats}
                              pineconeError={pineconeError}
                              onPineconeEnvChange={onPineconeEnvChange}
                            />
                          </div>
                        )}
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex justify-center border border-b-neutral-300 bg-neutral-100 py-2 text-sm text-neutral-500 dark:border-none dark:bg-[#444654] dark:text-neutral-200">
                        Model: {conversation.model.name}
                        <button
                          className="ml-2 cursor-pointer hover:opacity-50"
                          onClick={handleSettings}
                        >
                          <IconSettings size={18} />
                        </button>
                        <button
                          className="ml-2 cursor-pointer hover:opacity-50"
                          onClick={onClearAll}
                        >
                          <IconClearAll size={18} />
                        </button>
                      </div>
                      {showSettings && (
                        <div className="flex flex-col space-y-10 md:mx-auto md:max-w-xl md:gap-6 md:py-3 md:pt-6 lg:max-w-2xl lg:px-0 xl:max-w-3xl">
                          <div className="flex flex-col h-full p-4 space-y-4 border-b border-neutral-200 dark:border-neutral-600 md:rounded-lg md:border">
                            <ModelSelect
                              model={conversation.model}
                              models={models}
                              defaultModelId={defaultModelId}
                              onModelChange={(model) =>
                                onUpdateConversation(conversation, {
                                  key: "model",
                                  value: model,
                                })
                              }
                            />
                            <PineconeSetting
                              pineconeEnv={pineconeEnv}
                              pineconeStats={pineconeStats}
                              pineconeError={pineconeError}
                              onPineconeEnvChange={onPineconeEnvChange}
                            />
                          </div>
                        </div>
                      )}

                      {conversation.messages.map((message, index) => (
                        <ChatMessage
                          key={index}
                          message={message}
                          messageIndex={index}
                          onEditMessage={onEditMessage}
                        />
                      ))}

                      {loading && <ChatLoader />}

                      <div
                        className="h-[162px] bg-white dark:bg-[#343541]"
                        ref={messagesEndRef}
                      />
                    </>
                  )}
                </div>

                <ChatInput
                  stopConversationRef={stopConversationRef}
                  textareaRef={textareaRef}
                  messageIsStreaming={messageIsStreaming}
                  conversationIsEmpty={conversation.messages.length === 0}
                  messages={conversation.messages}
                  model={conversation.model}
                  onSend={(message: any) => {
                    setCurrentMessage(message);
                    onSend(message);
                  }}
                  onRegenerate={() => {
                    if (currentMessage) {
                      onSend(currentMessage, 2);
                    }
                  }}
                />
              </>
            )}
          </>
        )}
        {showScrollDownButton && (
          <div className="absolute bottom-0 right-0 pb-20 mb-4 mr-4">
            <button
              className="flex items-center justify-center text-gray-700 rounded-full shadow-md h-7 w-7 bg-neutral-200 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
              onClick={handleScrollDown}
            >
              <IconArrowDown size={18} />
            </button>
          </div>
        )}
      </div>
    );
  }
);
ChatSection.displayName = "ChatSection";
