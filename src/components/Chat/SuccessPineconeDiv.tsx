import { PineconeStats } from "@/types/pinecone";
import {
  IconUserCancel,
} from "@tabler/icons-react";
import { FC } from "react";

interface Props {
  pineconeStats: PineconeStats;
  onSetReset: () => void;
}

export const SuccessPineconeDiv: FC<Props> = ({
  pineconeStats,
  onSetReset,
}) => {
  const { namespaces, dimension, indexFullness, totalVectorCount } =
    pineconeStats;

  return (
    <div className="flex flex-col ">
      <div className="flex justify-between ">
        <h2 className="mb-2 text-left text-neutral-700 dark:text-neutral-400">
          Pinecone Stats:
        </h2>

        <button
          className="text-white h-7 w-7 hover:text-gray-400 dark:text-white dark:hover:text-gray-300 sm:left-4 sm:text-neutral-700"
          onClick={onSetReset}
        >
          <IconUserCancel />
        </button>
      </div>
      <div className="w-full p-2 bg-transparent border rounded-lg border-neutral-200 text-neutral-900 dark:border-neutral-600 dark:text-white">
        <div className="flex flex-col items-start mb-2 text-neutral-900 dark:text-white">
          <span className="mr-2 font-semibold">Namespaces:</span>
          <ul className="ml-2 md:ml-4">
            {Object.entries(namespaces).map(
              ([namespace, namespaceInfo], index) => (
                <li key={namespace}>
                  <span className="font-semibold">{index + 1} : </span>{" "}
                  {namespace},{" "}
                  <span className="font-semibold">Vector Count:</span>{" "}
                  {namespaceInfo.vectorCount}
                </li>
              )
            )}
          </ul>
        </div>
        <div className="flex items-center mb-2 text-neutral-900 dark:text-white">
          <span className="mr-2 font-semibold">Dimension:</span> {dimension}
        </div>
        <div className="flex items-center mb-2 text-neutral-900 dark:text-white">
          <span className="mr-2 font-semibold">Index Fullness:</span>{" "}
          {indexFullness}
        </div>
        <div className="flex items-center text-neutral-900 dark:text-white">
          <span className="mr-2 font-semibold">Total Vector Count:</span>{" "}
          {totalVectorCount}
        </div>
      </div>
    </div>
  );
};
