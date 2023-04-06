import { OpenAIModel, OpenAIModelID } from '@/types/openai';
import { IconExternalLink } from '@tabler/icons-react';
import { FC } from 'react';

interface Props {
  model: OpenAIModel;
  models: OpenAIModel[];
  defaultModelId: OpenAIModelID;
  onModelChange: (model: OpenAIModel) => void;
}

export const ModelSelect: FC<Props> = ({
  model,
  models,
  defaultModelId,
  onModelChange,
}) => {

  return (
    <div className="flex flex-col">
      <label className="mb-2 text-left text-neutral-700 dark:text-neutral-400">
        {'Model'}
      </label>
      <div className="w-full pr-2 bg-transparent border rounded-lg border-neutral-200 text-neutral-900 dark:border-neutral-600 dark:text-white">
        <select
          className="w-full p-2 bg-transparent"
          placeholder={'Select a model'}
          value={model?.id || defaultModelId}
          onChange={(e) => {
            onModelChange(
              models.find(
                (model) => model.id === e.target.value,
              ) as OpenAIModel,
            );
          }}
        >
          {models.map((model) => (
            <option
              key={model.id}
              value={model.id}
              className="dark:bg-[#343541] dark:text-white"
            >
              {model.id === defaultModelId
                ? `Default (${model.name})`
                : model.name}
            </option>
          ))}
        </select>
      </div>
      <div className="flex items-center w-full mt-3 text-left text-neutral-700 dark:text-neutral-400">
        <a href="https://platform.openai.com/account/usage" target="_blank" className="flex items-center">
          <IconExternalLink size={18} className={"inline mr-1"} />
          {'View Account Usage'}
        </a>
      </div>
    </div>
  );
};
