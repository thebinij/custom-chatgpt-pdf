import Head from "next/head";
import { GetServerSideProps } from "next";
import { useEffect, useRef, useState } from "react";
import { Navbar } from "@/components/Mobile/Navbar";
import { LeftBar } from "@/components/LeftSideBar/LeftBar";
import { ChatSection } from "@/components/Chat/ChatSection";
import { v4 as uuidv4 } from "uuid";
import { IconArrowBarRight } from "@tabler/icons-react";
import { ChatBody, Conversation, Message } from "@/types/chat";
import { ErrorMessage } from "@/types/error";
import { KeyValuePair } from "@/types/data";
import { LatestExportFormat, SupportedExportFormats } from "@/types/export";
import {
  OpenAIModel,
  OpenAIModelID,
  OpenAIModels,
  fallbackModelID,
} from "@/types/openai";
import {
  saveConversation,
  saveConversations,
  updateConversation,
} from "@/utils/app/converstion";
import { FETCHING_ERROR_MSG, FETCHING_ERROR_PINECONE } from "@/utils/app/const";
import { exportData, importData } from "@/utils/app/importExport";
import {
  cleanConversationHistory,
  cleanSelectedConversation,
} from "@/utils/app/clean";
import { PineConeEnv, PineconeStats } from "@/types/pinecone";

interface HomeProps {
  serverSideApiKeyIsSet: boolean;
  defaultModelId: OpenAIModelID;
}

const Home: React.FC<HomeProps> = ({
  serverSideApiKeyIsSet,
  defaultModelId,
}) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [lightMode, setLightMode] = useState<"dark" | "light">("dark");
  const [showSidebar, setShowSidebar] = useState<boolean>(true);
  const [models, setModels] = useState<OpenAIModel[]>([]);
  const [apiKey, setApiKey] = useState<string>("");
  const [pineconeEnv, setPineconeEnv] = useState<PineConeEnv>({
    apikey: "",
    indexURL: "",
  });
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] =
    useState<Conversation>();
  const [modelError, setModelError] = useState<ErrorMessage | null>(null);
  const [currentMessage, setCurrentMessage] = useState<Message>();
  const [messageIsStreaming, setMessageIsStreaming] = useState<boolean>(false);
  const [pineconeError, setPineconeError] = useState<ErrorMessage | null>(null);
  const [pineconeStats, setPineconeStats] = useState<PineconeStats | null>(
    null
  );

  // REFS ----------------------------------------------
  const stopConversationRef = useRef<boolean>(false);

  // BASIC HANDLERS --------------------------------------------
  const handleLightMode = (mode: "dark" | "light") => {
    setLightMode(mode);
    localStorage.setItem("theme", mode);
  };
  const handleApiKeyChange = (apiKey: string) => {
    setApiKey(apiKey);
    localStorage.setItem("apiKey", apiKey);
  };

  const handlePineConeEnvChange = (pinecone: PineConeEnv) => {
    setPineconeEnv(pinecone);
    localStorage.setItem("pineconeEnv", JSON.stringify(pinecone));
  };

  const handleToggleChatbar = () => {
    setShowSidebar(!showSidebar);
    localStorage.setItem("showChatbar", JSON.stringify(!showSidebar));
  };

  // CONVERSATION OPERATIONS  --------------------------------------------
  const handleNewConversation = () => {
    const lastConversation = conversations[conversations.length - 1];

    const newConversation: Conversation = {
      id: uuidv4(),
      name: "New Conversation",
      messages: [],
      model: lastConversation?.model || {
        id: OpenAIModels[defaultModelId].id,
        name: OpenAIModels[defaultModelId].name,
        maxLength: OpenAIModels[defaultModelId].maxLength,
        tokenLimit: OpenAIModels[defaultModelId].tokenLimit,
      },
    };

    const updatedConversations = [...conversations, newConversation];

    setSelectedConversation(newConversation);
    setConversations(updatedConversations);

    saveConversation(newConversation);
    saveConversations(updatedConversations);

    setLoading(false);
  };

  const handleDeleteConversation = (conversation: Conversation) => {
    const updatedConversations = conversations.filter(
      (c) => c.id !== conversation.id
    );
    setConversations(updatedConversations);
    saveConversations(updatedConversations);

    if (updatedConversations.length > 0) {
      setSelectedConversation(
        updatedConversations[updatedConversations.length - 1]
      );
      saveConversation(updatedConversations[updatedConversations.length - 1]);
    } else {
      setSelectedConversation({
        id: uuidv4(),
        name: "New conversation",
        messages: [],
        model: OpenAIModels[defaultModelId],
      });
      localStorage.removeItem("selectedConversation");
    }
  };

  const handleUpdateConversation = (
    conversation: Conversation,
    data: KeyValuePair
  ) => {
    const updatedConversation = {
      ...conversation,
      [data.key]: data.value,
    };

    const { single, all } = updateConversation(
      updatedConversation,
      conversations
    );

    setSelectedConversation(single);
    setConversations(all);
  };

  const handleClearConversations = () => {
    setConversations([]);
    localStorage.removeItem("conversationHistory");

    setSelectedConversation({
      id: uuidv4(),
      name: "New conversation",
      messages: [],
      model: OpenAIModels[defaultModelId],
    });
    localStorage.removeItem("selectedConversation");
  };

  const handleSelectConversation = (conversation: Conversation) => {
    setSelectedConversation(conversation);
    saveConversation(conversation);
  };

  const handleExportData = () => {
    exportData();
  };

  const handleImportConversations = (data: SupportedExportFormats) => {
    const { history }: LatestExportFormat = importData(data);

    setConversations(history);
    setSelectedConversation(history[history.length - 1]);
  };

  const handleEditMessage = (message: Message, messageIndex: number) => {
    if (selectedConversation) {
      const updatedMessages = selectedConversation.messages
        .map((m, i) => {
          if (i < messageIndex) {
            return m;
          }
        })
        .filter((m) => m) as Message[];

      const updatedConversation = {
        ...selectedConversation,
        messages: updatedMessages,
      };

      const { single, all } = updateConversation(
        updatedConversation,
        conversations
      );

      setSelectedConversation(single);
      setConversations(all);

      setCurrentMessage(message);
    }
  };

  // FETCH MODELS AND PINECONE STATs ----------------------------------------------
  const fetchModels = async (key: string) => {
    const error = FETCHING_ERROR_MSG;

    const response = await fetch("/api/models", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        key,
      }),
    });

    if (!response.ok) {
      try {
        const data = await response.json();
        Object.assign(error, {
          code: data.error?.code,
          messageLines: [data.error?.message],
        });
      } catch (e) {}
      setModelError(error);
      return;
    }

    const data = await response.json();

    if (!data) {
      setModelError(error);
      return;
    }

    setModels(data); //id: 'gpt-3.5-turbo', name: 'GPT-3.5'}
    setModelError(null);
  };

  // FETCH PINECONE STATS ----------------------------------------------
  const fetchPineconeStat = async (pineconeEnv: PineConeEnv) => {
    const error = FETCHING_ERROR_PINECONE;
    const response = await fetch("/api/pinecone", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(pineconeEnv),
    });

    if (!response.ok) {
      try {
        const data = await response.json();
        Object.assign(error, {
          code: data.error?.code,
          messageLines: [data.error?.message],
        });
      } catch (e) {}
      setPineconeError(error);
      return;
    }

    const data = await response.json();

    if (!data) {
      setPineconeError(error);
      return;
    }
    setPineconeStats(data);
    setPineconeError(null);
  };

  const splitMessage = (content:string ): { message: string, source: string } => {
    const sourceEndIndex = content.indexOf("[END_SOURCE]");
    if (sourceEndIndex !== -1) {
      const source = content.substring(0, sourceEndIndex - 1);
      const message = content.substring(sourceEndIndex + 13); // 13 is the length of "[END_SOURCE]"
      return { source, message };
    }
    return { source: "", message: content };
  };

  
  // FETCH RESPONSE ----------------------------------------------
  const handleSend = async (message: Message, deleteCount = 0) => {
    if (selectedConversation) {
      let updatedConversation: Conversation;

      if (deleteCount) {
        const updatedMessages = [...selectedConversation.messages];
        for (let i = 0; i < deleteCount; i++) {
          updatedMessages.pop();
        }

        updatedConversation = {
          ...selectedConversation,
          messages: [...updatedMessages, message],
        };
      } else {
        updatedConversation = {
          ...selectedConversation,
          messages: [...selectedConversation.messages, message],
        };
      }

      setSelectedConversation(updatedConversation);
      setLoading(true);
      setMessageIsStreaming(true);

      const chatBody: ChatBody = {
        model: updatedConversation.model,
        messages: updatedConversation.messages,
        openAIkey: apiKey,
        pineconeEnv: pineconeEnv,
      };
      const controller = new AbortController();

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        signal: controller.signal,
        body: JSON.stringify(chatBody),
      });

      if (!response.ok) {
        setLoading(false);
        setMessageIsStreaming(false);
        return;
      }

      const data = response.body;

      if (!data) {
        setLoading(false);
        setMessageIsStreaming(false);
        return;
      }

      if (updatedConversation.messages.length === 1) {
        const { content } = message;
        const customName =
          content.length > 30 ? content.substring(0, 30) + "..." : content;

        updatedConversation = {
          ...updatedConversation,
          name: customName,
        };
      }

      setLoading(false);

      const reader = data.getReader();
      const decoder = new TextDecoder();
      let done = false;
      let isFirst = true;
      let text = "";

      while (!done) {
        if (stopConversationRef.current === true) {
          controller.abort();
          done = true;
          break;
        }
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        const chunkValue = decoder.decode(value);
        text +=  isFirst ? splitMessage(chunkValue).message :chunkValue;


        if (isFirst) {
          isFirst = false;
          const {message ,source}= splitMessage(chunkValue)
          const updatedMessages: Message[] = [
            ...updatedConversation.messages,
            { role: "assistant", content: message, source:source },
          ];
     
          updatedConversation = {
            ...updatedConversation,
            messages: updatedMessages,
          };

         setSelectedConversation(updatedConversation);
        }
         else {
          const updatedMessages: Message[] = updatedConversation.messages.map(
            (message, index) => {
              if (index === updatedConversation.messages.length - 1) {
                return {
                  ...message,
                  content: text,
                };
              }

              return message;
            }
          );
          updatedConversation = {
            ...updatedConversation,
            messages: updatedMessages,
          };
       
        setSelectedConversation(updatedConversation);
        }
      }

      saveConversation(updatedConversation);

      const updatedConversations: Conversation[] = conversations.map(
        (conversation) => {
          if (conversation.id === selectedConversation.id) {
            return updatedConversation;
          }

          return conversation;
        }
      );

      if (updatedConversations.length === 0) {
        updatedConversations.push(updatedConversation);
      }

      setConversations(updatedConversations);

      saveConversations(updatedConversations);

      setMessageIsStreaming(false);
    }
  };

  // EFFECTS  --------------------------------------------

  useEffect(() => {
    if (apiKey) {
      fetchModels(apiKey);
    }
  }, [apiKey]);

  useEffect(() => {
    if (pineconeEnv.apikey && pineconeEnv.indexURL) {
      fetchPineconeStat(pineconeEnv);
    }
  }, [pineconeEnv]);

  useEffect(() => {
    if (currentMessage) {
      handleSend(currentMessage);
      setCurrentMessage(undefined);
    }
  }, [currentMessage]);

  useEffect(() => {
    if (window.innerWidth < 640) {
      setShowSidebar(false);
    }
  }, [selectedConversation]);

  // ON LOAD --------------------------------------------
  useEffect(() => {
    const theme = localStorage.getItem("theme");
    if (theme) {
      setLightMode(theme as "dark" | "light");
    }
    const apiKey = localStorage.getItem("apiKey");
    if (apiKey) {
      setApiKey(apiKey);
      fetchModels(apiKey);
    } else if (serverSideApiKeyIsSet) {
      fetchModels("");
    }

    const pineconeVar = localStorage.getItem("pineconeEnv");
    if (pineconeVar) {
      setPineconeEnv(JSON.parse(pineconeVar));
    }

    if (window.innerWidth < 640) {
      setShowSidebar(false);
    }

    const showChatbar = localStorage.getItem("showChatbar");
    if (showChatbar) {
      setShowSidebar(showChatbar === "true");
    }

    const conversationHistory = localStorage.getItem("conversationHistory");
    if (conversationHistory) {
      const parsedConversationHistory: Conversation[] =
        JSON.parse(conversationHistory);
      const cleanedConversationHistory = cleanConversationHistory(
        parsedConversationHistory
      );
      setConversations(cleanedConversationHistory);
    }

    const selectedConversation = localStorage.getItem("selectedConversation");
    if (selectedConversation) {
      const parsedSelectedConversation: Conversation =
        JSON.parse(selectedConversation);
      const cleanedSelectedConversation = cleanSelectedConversation(
        parsedSelectedConversation
      );
      setSelectedConversation(cleanedSelectedConversation);
    } else {
      setSelectedConversation({
        id: uuidv4(),
        name: "New conversation",
        messages: [],
        model: OpenAIModels[defaultModelId],
      });
    }
  }, [serverSideApiKeyIsSet, defaultModelId]);

  return (
    <>
      <Head>
        <title>Chatbot UI</title>
        <meta name="description" content="ChatGPT but better." />
        <meta
          name="viewport"
          content="height=device-height ,width=device-width, initial-scale=1, user-scalable=no"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {selectedConversation && (
        <main
          className={`flex h-screen w-screen flex-col text-sm text-white dark:text-white ${lightMode}`}
        >
          <div className="fixed top-0 w-full sm:hidden">
            <Navbar
              selectedConversation={selectedConversation}
              onNewConversation={handleNewConversation}
            />
          </div>

          <div className="flex h-full w-full pt-[48px] sm:pt-0">
            {showSidebar ? (
              <div>
                <LeftBar
                  loading={messageIsStreaming}
                  conversations={conversations}
                  lightMode={lightMode}
                  selectedConversation={selectedConversation}
                  apiKey={apiKey}
                  onToggleSidebar={handleToggleChatbar}
                  onToggleLightMode={handleLightMode}
                  onNewConversation={handleNewConversation}
                  onSelectConversation={handleSelectConversation}
                  onDeleteConversation={handleDeleteConversation}
                  onUpdateConversation={handleUpdateConversation}
                  onApiKeyChange={handleApiKeyChange}
                  onClearConversations={handleClearConversations}
                  onExportConversations={handleExportData}
                  onImportConversations={handleImportConversations}
                />
                <div
                  onClick={handleToggleChatbar}
                  className="absolute top-0 left-0 z-10 w-full h-full bg-black opacity-70 sm:hidden"
                ></div>
              </div>
            ) : (
              <button
                className="fixed top-2.5 left-4 z-50 h-7 w-7 text-white hover:text-gray-400 dark:text-white dark:hover:text-gray-300 sm:top-0.5 sm:left-4 sm:h-8 sm:w-8 sm:text-neutral-700"
                onClick={handleToggleChatbar}
              >
                <IconArrowBarRight />
              </button>
            )}
            <div className="flex flex-1">
              <ChatSection
                conversation={selectedConversation}
                messageIsStreaming={messageIsStreaming}
                apiKey={apiKey}
                pineconeEnv={pineconeEnv}
                pineconeStats={pineconeStats}
                pineconeError={pineconeError}
                onPineconeEnvChange={handlePineConeEnvChange}
                serverSideApiKeyIsSet={serverSideApiKeyIsSet}
                defaultModelId={defaultModelId}
                modelError={modelError}
                models={models}
                loading={loading}
                onSend={handleSend}
                onUpdateConversation={handleUpdateConversation}
                onEditMessage={handleEditMessage}
                stopConversationRef={stopConversationRef}
              />
            </div>
          </div>
        </main>
      )}
    </>
  );
};

export default Home;

export const getServerSideProps: GetServerSideProps = async () => {
  const defaultModelId =
    (process.env.DEFAULT_MODEL &&
      Object.values(OpenAIModelID).includes(
        process.env.DEFAULT_MODEL as OpenAIModelID
      ) &&
      process.env.DEFAULT_MODEL) ||
    fallbackModelID;

  return {
    props: {
      serverSideApiKeyIsSet: !!process.env.OPENAI_API_KEY,
      defaultModelId,
    },
  };
};
