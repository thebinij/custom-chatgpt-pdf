import { PineConeVar } from "@/types/pinecone";
import { IconX } from "@tabler/icons-react";
import { FC, useState, useEffect } from "react";

interface Props {
  pineconeVar: PineConeVar;
  handlePinecone: (pinecone: PineConeVar) => void;
}

export const PineconeSetting: FC<Props> = ({ pineconeVar, handlePinecone }) => {
  const [active, setActive] = useState<boolean>(false);
  const [isChange, setChanges] = useState<boolean>(false);
  const [newKey, setNewKey] = useState(pineconeVar.apikey);
  const [newIndexName, setNewIndexName] = useState(pineconeVar.index);
  const [newEnvironment, setNewEnv] = useState(pineconeVar.environment);

  const handleSave = (e: any) => {
    e.preventDefault();
    if (!newKey || !newIndexName || !newEnvironment) return;
    handlePinecone({
      apikey: newKey,
      index: newIndexName,
      environment: newEnvironment,
    });
    setChanges(false)
  };

  useEffect(() => {
    setChanges(true)
    if (newKey && newIndexName && newEnvironment) setActive(true);
    else setActive(false);
  }, [newKey, newIndexName, newEnvironment]);
  return (
    <>
      <div className="flex flex-col">
        <label className="mb-2 text-left text-neutral-700 dark:text-neutral-400">
          Pinecone API Key
        </label>

        <div className="relative w-full pr-2 bg-transparent border rounded-lg border-neutral-200 text-neutral-900 dark:border-neutral-600 dark:text-neutral-100">
          <input
            className="flex w-full p-2 text-left bg-transparent outline-none text-neutral-600 dark:text-white "
            type="password"
            value={newKey}
            onChange={(e) => setNewKey(e.target.value)}
            placeholder="API Key"
          />

{newKey && (  <button
        className="absolute top-2 right-1 text-neutral-700 dark:text-neutral-400 focus:outline-none"
        onClick={() => setNewKey("")}
      > <IconX
          className=" ml-auto min-w-[20px] text-neutral-400 dark:hover:text-neutral-100 hover:text-neutral-600"
          size={18}
       
        /></button>  


     )}
        </div>
      </div>
      <div className="grid grid-flow-col gap-2">
      <div className="flex flex-col">
        <label className="mb-2 text-left text-neutral-700 dark:text-neutral-400">
          Pinecone Environment
        </label>
        <div className="w-full pr-2 bg-transparent border rounded-lg border-neutral-200 text-neutral-900 dark:border-neutral-600 dark:text-neutral-100">
          <input
            className="flex w-full p-2 text-left bg-transparent outline-none e text-neutral-600 dark:text-white "
            type="text"
            value={newEnvironment}
            onChange={(e) => setNewEnv(e.target.value)}
            placeholder="Environment"
          />
        </div>
      </div>
      <div className="flex flex-col">
        <label className="mb-2 text-left text-neutral-700 dark:text-neutral-400">
          Pinecone Index Name
        </label>
        <div className="w-full pr-2 bg-transparent border rounded-lg border-neutral-200 text-neutral-900 dark:border-neutral-600 dark:text-neutral-100">
          <input
            className="flex w-full p-2 text-left bg-transparent outline-none text-neutral-600 dark:text-white "
            type="text"
            value={newIndexName}
            onChange={(e) => setNewIndexName(e.target.value)}
            placeholder="Index Name"
          />
        </div>
        
      </div>
      </div>
      <div className="flex flex-col">
      <button
          disabled={!active || !isChange}
          className={`h-[40px] mt-4 rounded-md border border-neutral-300 px-4 py-1 text-sm font-medium text-neutral-700 
    ${
      !active || !isChange
        ? "opacity-50 cursor-not-allowed"
        : "hover:bg-neutral-100 dark:hover:bg-neutral-800"
    }
    dark:border-neutral-700 dark:text-neutral-300`}
          onClick={(e) => handleSave(e)}
        >
          {isChange ? "Save" : "Saved"}
        </button></div>
  
    
    </>
  );
};
