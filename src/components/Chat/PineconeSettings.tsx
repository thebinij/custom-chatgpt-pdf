import { ErrorMessage } from "@/types/error";
import { PineConeEnv, PineconeStats } from "@/types/pinecone";
import { IconX } from "@tabler/icons-react";
import { FC, useState, useEffect } from "react";
import { ErrorMessageDiv } from "./ErrorMessageDiv";
import { SuccessPineconeDiv } from "./SuccessPineconeDiv";

interface Props {
  pineconeEnv: PineConeEnv;
  pineconeStats: PineconeStats| null;
  pineconeError: ErrorMessage | null;
  onPineconeEnvChange: (pinecone: PineConeEnv) => void;
}

export const PineconeSetting: FC<Props> = ({ pineconeEnv, onPineconeEnvChange,pineconeStats, pineconeError}) => {
  const [active, setActive] = useState<boolean>(false);
  const [isChange, setChanges] = useState<boolean>(false);
  const [newKey, setNewKey] = useState(pineconeEnv.apikey);
  const [newIndexURL, setNewIndexURL] = useState(pineconeEnv.indexURL);

  const handleReset = () => {
    onPineconeEnvChange({
      apikey: "",
      indexURL: "",
    });
    setNewKey("");
    setNewIndexURL("");
  };

  const handleSave = async (e: any) => {
    e.preventDefault();
    if (!newKey || !newIndexURL) return;
    const newPinecone = {
      apikey: newKey,
      indexURL: newIndexURL,
    };
     onPineconeEnvChange(newPinecone);
  };

  

  useEffect(() => {
    setChanges(true);
    if (newKey && newIndexURL) setActive(true);
    else setActive(false);
  }, [newKey, newIndexURL]);

  return (
    <>
      {pineconeStats ? (
        <SuccessPineconeDiv
          onSetReset={handleReset}
          pineconeStats={pineconeStats}
        />
      ) : (
        <>
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
          {/* Index URL */}
          <div className="flex flex-col">
            <label className="mb-2 text-left text-neutral-700 dark:text-neutral-400">
              Index URL
            </label>
            <div className="w-full pr-2 bg-transparent border rounded-lg border-neutral-200 text-neutral-900 dark:border-neutral-600 dark:text-neutral-100">
              <input
                className="flex w-full p-2 text-left bg-transparent outline-none text-neutral-600 dark:text-white "
                type="text"
                spellCheck={false}
                value={newIndexURL}
                onChange={(e) => setNewIndexURL(e.target.value)}
                placeholder="Index URL"
              />
            </div>
          </div>

          {pineconeError ? <ErrorMessageDiv error={pineconeError} /> : ""}

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
        </>
      )}
    </>
  );
};
