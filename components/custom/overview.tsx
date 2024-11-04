import { motion } from 'framer-motion';
import Link from 'next/link';

import { MessageIcon, VercelIcon } from './icons';

export const Overview = () => {
  return (
    <motion.div
      key="overview"
      className="max-w-3xl mx-auto md:mt-20"
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ delay: 0.5 }}
    >
      <div className="rounded-xl p-6 flex flex-col gap-8 leading-relaxed text-center max-w-xl">
        <p className="flex flex-row justify-center gap-4 items-center">
          <VercelIcon size={32} />
          <span>+</span>
          <MessageIcon size={32} />
        </p>
        <p>
          This is an{' '}
          <Link
            className="font-medium underline underline-offset-4"
            href="https://github.com/zincio/chatbot-demo"
            target="_blank"
          >
            open source
          </Link>{' '}
          chatbot template built with Next.js and the AI SDK by Vercel. It uses
          the Zinc{' '}
          <code className="rounded-md bg-muted px-1 py-0.5">Product Search</code>{' '} and
          <code className="rounded-md bg-muted px-1 py-0.5">AutoOrdering</code> APIs to help
          you shop on Amazon.
        </p>
        <p>
          You can learn more about the Zinc API by visiting the{' '}
          <Link
            className="font-medium underline underline-offset-4"
            href="https://docs.zincapi.com/#ai"
            target="_blank"
          >
            docs
          </Link>
          .
        </p>
      </div>
    </motion.div>
  );
};
