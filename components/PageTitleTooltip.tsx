import { QuestionMarkCircledIcon } from '@radix-ui/react-icons';
import * as Tooltip from '@radix-ui/react-tooltip';

interface PageTitleTooltipProps {
  title: string;
  tooltip: string;
  className?: string;
}

export default function PageTitleTooltip({ title, tooltip, className = '' }: PageTitleTooltipProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <h1 className="text-3xl font-bold text-game-accent">{title}</h1>
      <Tooltip.Provider delayDuration={200}>
        <Tooltip.Root>
          <Tooltip.Trigger asChild>
            <button className="text-game-accent/60 hover:text-game-accent transition-colors">
              <QuestionMarkCircledIcon className="w-5 h-5" />
            </button>
          </Tooltip.Trigger>
          <Tooltip.Portal>
            <Tooltip.Content
              className="bg-game-dark/95 backdrop-blur-sm border border-game-accent/20 rounded-lg px-4 py-2 text-sm max-w-xs text-game-text shadow-xl animate-fadeIn"
              sideOffset={5}
            >
              {tooltip}
              <Tooltip.Arrow className="fill-game-dark/95" />
            </Tooltip.Content>
          </Tooltip.Portal>
        </Tooltip.Root>
      </Tooltip.Provider>
    </div>
  );
} 