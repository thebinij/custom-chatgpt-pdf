import { PineConeVar } from '@/types/pinecone';
import { Prompt } from '@/types/prompt';
import {
  IconMistOff,
  IconPlus,
} from '@tabler/icons-react';
import { FC } from 'react';


interface Props {
  prompts: Prompt[];
  pineconeVar: PineConeVar;
}

export const RightBar: FC<Props> = ({
  prompts,
  pineconeVar,
}) => {

  const handleDrop = (e: any) => {
    if (e.dataTransfer) {
      const prompt = JSON.parse(e.dataTransfer.getData('prompt'));

      const updatedPrompt = {
        ...prompt,
        folderId: e.target.dataset.folderId,
      };

    //   onUpdatePrompt(updatedPrompt);

      e.target.style.background = 'none';
    }
  };

  const allowDrop = (e: any) => {
    e.preventDefault();
  };

  const highlightDrop = (e: any) => {
    
    e.target.style.background = '#343541';
  };

  const removeHighlight = (e: any) => {
    e.target.style.background = 'none';
  };

  const handleSourceFile =  async() => {
    // Create a file input element
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.pdf';
  
    // Add an event listener to handle file selection
    input.addEventListener('change', async(e: any) => {
      if (!e.target || !e.target.files || e.target.files.length === 0) return;
  
      const file = e.target.files[0];
      // Perform further actions with the selected file, such as uploading to a server
      console.log('Selected file:', file);
 
    });
  
    // Trigger click event to open file input dialog
    input.click();
  };

  return (
    <div
      className={`fixed top-0 right-0 z-50 flex h-full w-[260px] flex-none flex-col space-y-2 bg-[#202123] p-2 text-[14px] transition-all sm:relative sm:top-0`}
    >
      <div className="flex items-center">
        <button
          className="text-sidebar flex w-[245px] flex-shrink-0 cursor-pointer select-none items-center gap-3 rounded-md border border-white/20 p-3 text-white transition-colors duration-200 hover:bg-gray-500/10"
          onClick={handleSourceFile}
        >
          <IconPlus size={16} />
          Add PDF Document
        </button>

        {/* <button
          className="flex items-center flex-shrink-0 gap-3 p-3 ml-2 text-sm text-white transition-colors duration-200 border rounded-md cursor-pointer border-white/20 hover:bg-gray-500/10"
          onClick={() => onCreateFolder(t('New folder'))}
        >
          <IconFolderPlus size={16} />
        </button> */}

      
      </div>

      {/* {prompts.length > 1 && (
        <Search
          placeholder={t('Search prompts...') || ''}
          searchTerm={searchTerm}
          onSearch={setSearchTerm}
        />
      )} */}

      <div className="flex-grow overflow-auto">
        {/* {folders.length > 0 && (
          <div className="flex pb-2 border-b border-white/20">
            <PromptFolders
              searchTerm={searchTerm}
              prompts={filteredPrompts}
              folders={folders}
              onUpdateFolder={onUpdateFolder}
              onDeleteFolder={onDeleteFolder}
              // prompt props
              onDeletePrompt={handleDeletePrompt}
              onUpdatePrompt={handleUpdatePrompt}
            />
          </div>
        )} */}

        {prompts.length > 0 ? (
          <div
            className="h-full pt-2"
            onDrop={(e) => handleDrop(e)}
            onDragOver={allowDrop}
            onDragEnter={highlightDrop}
            onDragLeave={removeHighlight}
          >
            {/* <Prompts
              prompts={filteredPrompts.filter((prompt) => !prompt.folderId)}
              onUpdatePrompt={handleUpdatePrompt}
              onDeletePrompt={handleDeletePrompt}
            /> */}
          </div>
        ) : (
          <div className="mt-8 text-center text-white opacity-50 select-none">
            <IconMistOff className="mx-auto mb-3" />
            <span className="text-[14px] leading-normal">
              No documents.
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
