import { Navbar } from "@/components/Mobile/Navbar";
import { Conversation } from "@/types/chat";
import { OpenAIModel, OpenAIModelID, OpenAIModels, fallbackModelID } from "@/types/openai";
import Head from "next/head";
import { useEffect, useState } from "react";
import { IconArrowBarLeft, IconArrowBarRight } from "@tabler/icons-react";
import { Chatbar } from "@/components/Chatbar/Chatbar";
import { Folder, FolderType } from "@/types/folder";
import { v4 as uuidv4 } from 'uuid';
import { saveConversation, saveConversations, updateConversation } from "@/utils/app/converstion";
import { saveFolders } from "@/utils/app/folders";
import { KeyValuePair } from "@/types/data";
import { DEFAULT_SYSTEM_PROMPT } from "@/utils/app/const";
import { LatestExportFormat, SupportedExportFormats } from "@/types/export";
import { exportData, importData } from "@/utils/app/importExport";
import { GetServerSideProps } from "next";
import { ErrorMessage } from "@/types/error";
import { cleanConversationHistory, cleanSelectedConversation } from "@/utils/app/clean";

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
  const [messageIsStreaming, setMessageIsStreaming] = useState<boolean>(false);
  const [apiKey, setApiKey] = useState<string>('');
  const [folders, setFolders] = useState<Folder[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] =
    useState<Conversation>();

  const [showSidebar, setShowSidebar] = useState<boolean>(true);

  const [models, setModels] = useState<OpenAIModel[]>([]);

  const [modelError, setModelError] = useState<ErrorMessage | null>(null);


    // BASIC HANDLERS --------------------------------------------

    const handleLightMode = (mode: 'dark' | 'light') => {
      setLightMode(mode);
      localStorage.setItem('theme', mode);
    };
    const handleApiKeyChange = (apiKey: string) => {
      setApiKey(apiKey);
      localStorage.setItem('apiKey', apiKey);
    };
    const handleToggleChatbar = () => {
      setShowSidebar(!showSidebar);
      localStorage.setItem("showChatbar", JSON.stringify(!showSidebar));
    };

    // FOLDER OPERATIONS  --------------------------------------------

  const handleCreateFolder = (name: string, type: FolderType) => {
    const newFolder: Folder = {
      id: uuidv4(),
      name,
      type,
    };

    const updatedFolders = [...folders, newFolder];

    setFolders(updatedFolders);
    saveFolders(updatedFolders);
  };

  const handleDeleteFolder = (folderId: string) => {
    const updatedFolders = folders.filter((f) => f.id !== folderId);
    setFolders(updatedFolders);
    saveFolders(updatedFolders);

    const updatedConversations: Conversation[] = conversations.map((c) => {
      if (c.folderId === folderId) {
        return {
          ...c,
          folderId: null,
        };
      }

      return c;
    });
    setConversations(updatedConversations);
    saveConversations(updatedConversations);

    // const updatedPrompts: Prompt[] = prompts.map((p) => {
    //   if (p.folderId === folderId) {
    //     return {
    //       ...p,
    //       folderId: null,
    //     };
    //   }

    //   return p;
    // });
    // setPrompts(updatedPrompts);
    // savePrompts(updatedPrompts);
  };

  const handleUpdateFolder = (folderId: string, name: string) => {
    const updatedFolders = folders.map((f) => {
      if (f.id === folderId) {
        return {
          ...f,
          name,
        };
      }

      return f;
    });

    setFolders(updatedFolders);
    saveFolders(updatedFolders);
  };

  // CONVERSATION OPERATIONS  --------------------------------------------

  const handleNewConversation = () => {
    const lastConversation = conversations[conversations.length - 1];

    const newConversation: Conversation = {
      id: uuidv4(),
      name: 'New Conversation',
      messages: [],
      model: lastConversation?.model || {
        id: OpenAIModels[defaultModelId].id,
        name: OpenAIModels[defaultModelId].name,
        maxLength: OpenAIModels[defaultModelId].maxLength,
        tokenLimit: OpenAIModels[defaultModelId].tokenLimit,
      },
      prompt: DEFAULT_SYSTEM_PROMPT,
      folderId: null,
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
      (c) => c.id !== conversation.id,
    );
    setConversations(updatedConversations);
    saveConversations(updatedConversations);

    if (updatedConversations.length > 0) {
      setSelectedConversation(
        updatedConversations[updatedConversations.length - 1],
      );
      saveConversation(updatedConversations[updatedConversations.length - 1]);
    } else {
      setSelectedConversation({
        id: uuidv4(),
        name: 'New conversation',
        messages: [],
        model: OpenAIModels[defaultModelId],
        prompt: DEFAULT_SYSTEM_PROMPT,
        folderId: null,
      });
      localStorage.removeItem('selectedConversation');
    }
  };

  const handleUpdateConversation = (
    conversation: Conversation,
    data: KeyValuePair,
  ) => {
    const updatedConversation = {
      ...conversation,
      [data.key]: data.value,
    };

    const { single, all } = updateConversation(
      updatedConversation,
      conversations,
    );

    setSelectedConversation(single);
    setConversations(all);
  };

  const handleClearConversations = () => {
    setConversations([]);
    localStorage.removeItem('conversationHistory');

    setSelectedConversation({
      id: uuidv4(),
      name: 'New conversation',
      messages: [],
      model: OpenAIModels[defaultModelId],
      prompt: DEFAULT_SYSTEM_PROMPT,
      folderId: null,
    });
    localStorage.removeItem('selectedConversation');

    const updatedFolders = folders.filter((f) => f.type !== 'chat');
    setFolders(updatedFolders);
    saveFolders(updatedFolders);
  };
  

  const handleSelectConversation = (conversation: Conversation) => {
    setSelectedConversation(conversation);
    saveConversation(conversation);
  };

  const handleExportData = () => {
    exportData();
  };

  const handleImportConversations = (data: SupportedExportFormats) => {
    const { history, folders }: LatestExportFormat = importData(data);

    setConversations(history);
    setSelectedConversation(history[history.length - 1]);
    setFolders(folders);
  };
  // FETCH MODELS ----------------------------------------------

  const fetchModels = async (key: string) => {
    const error = {
      title: 'Error fetching models.',
      code: null,
      messageLines: [
       
          'Make sure your OpenAI API key is set in the bottom left of the sidebar.'
       ,
       'If you completed this step, OpenAI may be experiencing issues.',
      ],
    } as ErrorMessage;

    const response = await fetch('/api/models', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
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

    setModels(data);
    setModelError(null);
  };

// ON LOAD --------------------------------------------

useEffect(() => {
  const theme = localStorage.getItem('theme');
  if (theme) {
    setLightMode(theme as 'dark' | 'light');
  }
  const apiKey = localStorage.getItem('apiKey');
  if (apiKey) {
    setApiKey(apiKey);
    fetchModels(apiKey);
  } else if (serverSideApiKeyIsSet) {
    fetchModels('');
  }

  if (window.innerWidth < 640) {
    setShowSidebar(false);
  }

  const showChatbar = localStorage.getItem('showChatbar');
  if (showChatbar) {
    setShowSidebar(showChatbar === 'true');
  }
  const folders = localStorage.getItem('folders');
  if (folders) {
    setFolders(JSON.parse(folders));
  }
  const conversationHistory = localStorage.getItem('conversationHistory');
  if (conversationHistory) {
    const parsedConversationHistory: Conversation[] =
      JSON.parse(conversationHistory);
    const cleanedConversationHistory = cleanConversationHistory(
      parsedConversationHistory,
    );
    setConversations(cleanedConversationHistory);
  }

  const selectedConversation = localStorage.getItem('selectedConversation');
  if (selectedConversation) {
    const parsedSelectedConversation: Conversation =
      JSON.parse(selectedConversation);
    const cleanedSelectedConversation = cleanSelectedConversation(
      parsedSelectedConversation,
    );
    setSelectedConversation(cleanedSelectedConversation);
  } else {
    setSelectedConversation({
      id: uuidv4(),
      name: 'New conversation',
      messages: [],
      model: OpenAIModels[defaultModelId],
      prompt: DEFAULT_SYSTEM_PROMPT,
      folderId: null,
    });
  }
},[serverSideApiKeyIsSet]);

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
            <Chatbar
              loading={messageIsStreaming}
              conversations={conversations}
              lightMode={lightMode}
              selectedConversation={selectedConversation}
              apiKey={apiKey}
              folders={folders.filter((folder) => folder.type === "chat")}
              onToggleLightMode={handleLightMode}
              onCreateFolder={(name) => handleCreateFolder(name, "chat")}
              onDeleteFolder={handleDeleteFolder}
              onUpdateFolder={handleUpdateFolder}
              onNewConversation={handleNewConversation}
              onSelectConversation={handleSelectConversation}
              onDeleteConversation={handleDeleteConversation}
              onToggleSidebar={handleToggleChatbar}
              onUpdateConversation={handleUpdateConversation}
              onApiKeyChange={handleApiKeyChange}
              onClearConversations={handleClearConversations}
              onExportConversations={handleExportData}
              onImportConversations={handleImportConversations}
            />

            <button
              className="fixed top-5 left-[270px] z-50 h-7 w-7 hover:text-gray-400 dark:text-white dark:hover:text-gray-300 sm:top-0.5 sm:left-[270px] sm:h-8 sm:w-8 sm:text-neutral-700"
              onClick={handleToggleChatbar}
            >
              <IconArrowBarLeft />
            </button>
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
        process.env.DEFAULT_MODEL as OpenAIModelID,
      ) &&
      process.env.DEFAULT_MODEL) ||
    fallbackModelID;

  return {
    props: {
      serverSideApiKeyIsSet: !!process.env.OPENAI_API_KEY,
      defaultModelId
    },
  };
};