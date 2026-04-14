import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { ChevronDownIcon, CheckIcon } from '@heroicons/react/24/outline';
import { setSelectedModel, isSameModelIdentity, getModelIdentityKey } from '../store/slices/modelSlice';

interface ModelSelectorProps {
  dropdownDirection?: 'up' | 'down';
}

const ModelSelector: React.FC<ModelSelectorProps> = ({ dropdownDirection = 'down' }) => {
  const dispatch = useDispatch();
  const [isOpen, setIsOpen] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const selectedModel = useSelector((state: RootState) => state.model.selectedModel);
  const availableModels = useSelector((state: RootState) => state.model.availableModels);

  // 点击外部区域关闭下拉框
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleModelSelect = (model: typeof availableModels[0]) => {
    dispatch(setSelectedModel(model));
    setIsOpen(false);
  };

  // 如果没有可用模型，显示提示
  if (availableModels.length === 0) {
    return (
      <div className="px-3 py-1.5 rounded-xl dark:bg-surface bg-surface dark:text-secondary text-secondary text-sm">
        请先在设置中配置模型
      </div>
    );
  }

  const dropdownPositionClass = dropdownDirection === 'up'
    ? 'bottom-full mb-1'
    : 'top-full mt-1';

  return (
    <div ref={containerRef} className="relative cursor-pointer">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center space-x-2 px-3 py-1.5 rounded-xl hover:bg-surface-raised dark:text-foreground text-foreground transition-colors cursor-pointer ${isOpen ? 'dark:bg-surface-raised bg-surface-raised' : ''}`}
      >
        <span className="font-medium text-sm">{selectedModel.name}</span>
        <ChevronDownIcon className="h-4 w-4 dark:text-secondary text-secondary" />
      </button>

      {isOpen && (
        <div className={`absolute ${dropdownPositionClass} w-52 dark:bg-surface bg-surface rounded-xl popover-enter shadow-popover z-50 border-border border overflow-hidden`}>
          <div className="max-h-64 overflow-y-auto">
          {availableModels.map((model) => (
            <button
              key={getModelIdentityKey(model)}
              onClick={() => handleModelSelect(model)}
              className={`w-full px-4 py-2.5 text-left dark:text-foreground text-foreground hover:bg-surface-raised flex items-center justify-between transition-colors ${
                isSameModelIdentity(model, selectedModel) ? 'dark:bg-surface-raised/50 bg-surface-raised/50' : ''
              }`}
            >
              <div className="flex flex-col">
                <span className="text-sm">{model.name}</span>
                {model.provider && (
                  <span className="text-xs dark:text-secondary text-secondary">{model.provider}</span>
                )}
              </div>
              {isSameModelIdentity(model, selectedModel) && (
                <CheckIcon className="h-4 w-4 text-primary" />
              )}
            </button>
          ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ModelSelector;
