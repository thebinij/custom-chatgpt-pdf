import { ErrorMessage } from "@/types/error";
import { PineConeVar, PineconeStats } from "@/types/pinecone";
import { FETCHING_ERROR_PINECONE } from "@/utils/app/const";
import { IconX } from "@tabler/icons-react";
import { FC, useState, useEffect } from "react";
import { ErrorMessageDiv } from "./ErrorMessageDiv";
import { SuccessPineconeDiv } from "./SuccessPineconeDiv";

interface Props {
  pineconeVar: PineConeVar;
  handlePinecone: (pinecone: PineConeVar) => void;
}

export const PineconeSetting: FC<Props> = ({ pineconeVar, handlePinecone }) => {
  const [active, setActive] = useState<boolean>(false);
  const [isChange, setChanges] = useState<boolean>(false);
  const [newKey, setNewKey] = useState(pineconeVar.apikey);
  const [newIndexName, setNewIndexName] = useState(pineconeVar.index);
  const [newProjectID, setNewProjectID] = useState(pineconeVar.projectId);
  const [newEnvironment, setNewEnv] = useState(pineconeVar.environment);
  const [pineconeStats, setPineconeStats] = useState<PineconeStats>();
  const [pineconeError, setPineconeError] = useState<ErrorMessage |null>(null)

  // FETCH PINECONE STATS ----------------------------------------------
  const fetchPineconeStat = async (pineconeVar: PineConeVar) => {
    const error = FETCHING_ERROR_PINECONE;
    const response = await fetch("/api/pinecone", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(
        pineconeVar,
      ),
    });

    if (!response.ok) {
      try {
        const data = await response.json();
        Object.assign(error, {
          code: data.error?.code,
          messageLines: [data.error?.message],
        });
      } catch (e) {}
      setPineconeError(error)
      return;
    }

    const data = await response.json();

    if (!data) {
      setPineconeError(error)
      return;
    }
    setPineconeStats(data)
    handlePinecone(pineconeVar);
    setChanges(false);
    setPineconeError(null)
  };

  const handleReset = ()=>{
    setPineconeStats(undefined)
    setNewKey("")
    setNewProjectID("")
    setNewIndexName("")
    setNewEnv("")
  }


  const handleSave = async(e: any) => {
    e.preventDefault();
    if (!newKey || !newIndexName || !newEnvironment || !newProjectID) return;
    const newPinecone ={
      apikey: newKey,
      index: newIndexName,
      environment: newEnvironment,
      projectId:newProjectID
    }
     await fetchPineconeStat(newPinecone)
  
  };

  useEffect(() => {
    const fetchData = async () => { 
      if (newKey && newIndexName && newEnvironment && newProjectID) {
        await fetchPineconeStat(pineconeVar);
      }
    };
  
    fetchData(); 
  }, []); 

  useEffect(() => {
    setChanges(true);
    if (newKey && newIndexName && newEnvironment && newProjectID) setActive(true);
    else setActive(false);
  }, [newKey, newIndexName, newEnvironment, newProjectID]);
  
  return (
    <>
 {pineconeStats ? (
         <SuccessPineconeDiv onSetReset={handleReset} pineconeStats={pineconeStats}/> ) :
         (
      <>
    <div className="grid grid-flow-col gap-2">
          {/* API KEY */}
      <div className="flex flex-col">
        <label className="mb-2 text-left text-neutral-700 dark:text-neutral-400">
          Pinecone API Key
        </label>

        <div className="relative w-full pr-2 bg-transparent border rounded-lg border-neutral-200 text-neutral-900 dark:border-neutral-600 dark:text-neutral-100">
          <input
            className="flex w-full p-2 pr-4 text-left bg-transparent outline-none text-neutral-600 dark:text-white "
            type="password"
            value={newKey}
            onChange={(e) => setNewKey(e.target.value)}
            placeholder="API Key"
          />

          {newKey && (
            <button
              className="absolute top-2 right-1 text-neutral-700 dark:text-neutral-400 focus:outline-none"
              onClick={() => setNewKey("")}
            >
              {" "}
              <IconX
                className=" ml-auto min-w-[20px] text-neutral-400 dark:hover:text-neutral-100 hover:text-neutral-600"
                size={18}
              />
            </button>
          )}
        </div>
      </div>
         {/* Envrionment */}
         <div className="flex flex-col">
          <label className="mb-2 text-left text-neutral-700 dark:text-neutral-400">
            Environment
          </label>
          <div className="w-full pr-2 bg-transparent border rounded-lg border-neutral-200 text-neutral-900 dark:border-neutral-600 dark:text-neutral-100">
            <input
              className="flex w-full p-2 text-left bg-transparent outline-none e text-neutral-600 dark:text-white "
              type="text"
              spellCheck={false}
              value={newEnvironment}
              onChange={(e) => setNewEnv(e.target.value)}
              placeholder="Environment"
            />
          </div>
        </div>
      </div>

       {/* Index and ProjectID */}
      <div className="grid grid-flow-col gap-2">

        {/* Index */}
        <div className="flex flex-col">
          <label className="mb-2 text-left text-neutral-700 dark:text-neutral-400">
            Index Name
          </label>
          <div className="w-full pr-2 bg-transparent border rounded-lg border-neutral-200 text-neutral-900 dark:border-neutral-600 dark:text-neutral-100">
            <input
              className="flex w-full p-2 text-left bg-transparent outline-none text-neutral-600 dark:text-white "
              type="text"
              spellCheck={false}
              value={newIndexName}
              onChange={(e) => setNewIndexName(e.target.value)}
              placeholder="Index Name"
            />
          </div>
        </div>

        {/* ProjectID */}
        <div className="flex flex-col">
          <label className="mb-2 text-left text-neutral-700 dark:text-neutral-400">
            Project ID
          </label>
          <div className="w-full pr-2 bg-transparent border rounded-lg border-neutral-200 text-neutral-900 dark:border-neutral-600 dark:text-neutral-100">
            <input
              className="flex w-full p-2 text-left bg-transparent outline-none e text-neutral-600 dark:text-white "
              type="text"
              spellCheck={false}
              value={newProjectID}
              onChange={(e) => setNewProjectID(e.target.value)}
              placeholder="ProjectID"
            />
          </div>
        </div>
        
      </div>
      {pineconeError ? (
          <ErrorMessageDiv error={pineconeError} />) : ""}

       {/* Save Button */}
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
        </button>
      </div>
      </>)}
    </>
  );
};
