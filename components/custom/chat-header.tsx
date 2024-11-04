import Link from 'next/link';

import { ModelSelector } from '@/components/custom/model-selector';
import { Button } from '@/components/ui/button';
import { BetterTooltip } from '@/components/ui/tooltip';

import { PlusIcon } from './icons';

export function ChatHeader({ selectedModelId }: { selectedModelId: string }) {
  return (
    <header className="flex h-16 sticky top-0 bg-background md:h-12 items-center px-2 md:px-2 gap-2">
      <BetterTooltip content="New Chat">
        <Button
          variant="ghost"
          className="w-auto md:size-8 [&>svg]:!size-5 md:[&>svg]:!size-4 pl-2 md:p-0 order-2 md:order-1 ml-auto md:ml-0"
          asChild
        >
          <Link href="/">
            <PlusIcon />
            <span className="md:sr-only">New Chat</span>
          </Link>
        </Button>
      </BetterTooltip>
      <ModelSelector
        selectedModelId={selectedModelId}
        className="order-1 md:order-2"
      />
    </header>
  );
}
