'use client';

import { Attachment, ToolInvocation } from 'ai';
import cx from 'classnames';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { Dispatch, ReactNode, SetStateAction } from 'react';

import { Markdown } from './markdown';
import { SearchResults } from './search';
import { Weather } from './weather';

export const Message = ({
  role,
  content,
  toolInvocations,
}: {
  role: string;
  content: string | ReactNode;
  toolInvocations: Array<ToolInvocation> | undefined;
  attachments?: Array<Attachment>;
}) => {
  return (
    <motion.div
      className="w-full mx-auto max-w-3xl px-4 group/message "
      initial={{ y: 5, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      data-role={role}
    >
      <div
        className={cx(
          'flex gap-4 group-data-[role=user]/message:px-5 w-full group-data-[role=user]/message:w-fit group-data-[role=user]/message:ml-auto group-data-[role=user]/message:max-w-2xl group-data-[role=user]/message:py-3.5 rounded-xl',
        )}
      >
        {role === 'assistant' && (
          <div className="size-8 flex items-center rounded-full justify-center ring-1 shrink-0 ring-border">
            <Sparkles className="size-4" />
          </div>
        )}
        <div className="flex flex-col gap-2 w-full">
          {content && (
            <div className="flex flex-col gap-4">
              <Markdown>{content as string}</Markdown>
            </div>
          )}

          {toolInvocations && toolInvocations.length > 0 && (
            <div className="flex flex-col gap-4">
              {toolInvocations.map((toolInvocation) => {
                const { toolName, toolCallId, state, args } = toolInvocation;

                if (state === 'result') {
                  const { result } = toolInvocation;

                  return (
                    <div key={toolCallId + "-res"}>
                      <div className="hazard-border mt-1 mb-2">
                        <h2 className="text-xl font-extrabold mt-1">{toolName} request</h2>
                        <pre>
                          {JSON.stringify(args, null, 2)}
                        </pre>
                      </div>
                      {toolName === 'getWeather' ? (
                        <Weather weatherAtLocation={result} />
                      ) : toolName === 'productSearch' ? (
                        <SearchResults results={result} />
                      ) : toolName === 'productPurchase2' ? (
                        <pre>purchase result here</pre>
                      ) : (
                        <div className="hazard-border">
                          <h2 className="text-xl font-extrabold mt-1">{toolName} response</h2>
                          <pre>
                            {JSON.stringify(result, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                  );
                } else {
                  return (
                    <div key={toolCallId + "-req"}>
                      <div className="hazard-border">
                        <h2 className="text-xl font-extrabold mt-1">{toolName} request</h2>
                        <pre>
                          {JSON.stringify(args, null, 2)}
                        </pre>
                      </div>
                    </div>
                  );
                }
              })}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};
