import {
  convertToCoreMessages,
  generateObject,
  Message,
  StreamData,
  streamObject,
  streamText,
} from 'ai';
import { z } from 'zod';

import { customModel } from '@/ai';
import { models } from '@/ai/models';
import { shoppingPrompt } from '@/ai/prompts';
import {
  saveChat,
} from '@/db/queries';
import { generateUUID, sanitizeResponseMessages } from '@/lib/utils';

export const maxDuration = 60;

type AllowedTools = 'productSearch' | 'productPurchase' | 'productVariants' | 'productDetails' | 'productReviews';

const allowedTools: AllowedTools[] = ['productSearch', 'productPurchase', 'productVariants', 'productDetails', 'productReviews'];

const ZINCAPI_CREDS = process.env.ZINCAPI_CREDS || "";
const LIBPOSTAL_CREDS = process.env.LIBPOSTAL_CREDS || "";

interface ZincAddress {
  first_name: string;
  last_name: string;
  address_line1: string;
  address_line2: string | null | undefined;
  city: string;
  state: string;
  zip_code: string;
  country: string;
  error: undefined;
  address: undefined;
  parsed: undefined;
}

type ZincAddressResponse = ZincAddress | {
  error: string;
  address: string;
  parsed: ZincAddress;
}

// Parse and validate the shipping address from human-readable format to structured format
// NOTE: this function is now implemented as part of the Zinc Buy API for AI.
// You can simply provide the shipping address in textual format using the `shipping_address` key.
// For best results, pre-parse the shipping address yourself and geocode using e.g. Google Addresses API
async function parseAndValidateAddress(address: string) : Promise<ZincAddressResponse> {
  const headers = new Headers({
    Authorization: `Basic ${Buffer.from(LIBPOSTAL_CREDS, "binary").toString("base64")}`,
    "Content-type": "application/json",
  });
  const response = await fetch(
    'https://libpostal.znsrv.com/zinc_parse_address',
    {headers, body: JSON.stringify({address}), method: "POST"},
  );
  const js = await response.json();
  return js;
}

// Fetch Product Data from Zinc API using AI-optimized routes
async function aiProductDetails(method: "details" | "variants" | "offers" | "reviews", retailer: "amazon", productId: string) : Promise<any> {
  const headers = new Headers({
    Authorization: `Basic ${Buffer.from(ZINCAPI_CREDS, "binary").toString("base64")}`
  });
  const response = await fetch(
    `https://api.zinc.io/v1/ai/products/${encodeURIComponent(productId)}/${method}?retailer=${encodeURIComponent(retailer)}`,
    {headers},
  );
  const js = await response.json();
  return js;
}

async function aiProductSearch(retailer: "amazon", query: string, limit: number, page: number) : Promise<any> {
  const headers = new Headers({
    Authorization: `Basic ${Buffer.from(ZINCAPI_CREDS, "binary").toString("base64")}`
  });
  const response = await fetch(
    `https://api.zinc.io/v1/ai/search?retailer=amazon&query=${encodeURIComponent(query)}&limit=${limit}&page=${page}`,
    {headers},
  );
  const js = await response.json();
  return js;
}

export async function POST(request: Request) {
  const {
    id,
    messages,
    modelId,
  }: { id: string; messages: Array<Message>; modelId: string } =
    await request.json();

  const model = models.find((model) => model.id === modelId);

  if (!model) {
    return new Response('Model not found', { status: 404 });
  }

  const coreMessages = convertToCoreMessages(messages);
  const streamingData = new StreamData();

  const result:any = await streamText({
    model: customModel(model.apiIdentifier),
    system: shoppingPrompt,
    messages: coreMessages,
    maxSteps: 5,
    experimental_activeTools:
      allowedTools,
    tools: {

      productSearch: {
        description: 'Search Amazon for a list of products',
        parameters: z.object({
          searchTerm: z.string(),
        }),
        execute: async ({ searchTerm }) => {
          console.log(`Searching Amazon for ${searchTerm}`)
          try {
            const simple = await aiProductSearch("amazon", searchTerm, 6, 1)
            console.log("Got response", {simple})
            return simple;
          }
          catch (err) {
            console.log("Hit error", {err})
            return {"error": "API request failed"};
          }
        },
      },

      productDetails: {
        description: 'Return extra information about a product on Amazon',
        parameters: z.object({
          productId: z.string().length(10),
        }),
        execute: async ({ productId }) => {
          try {
            const simple = await aiProductDetails("details", "amazon", productId);
            console.log("Got response", {simple})
            return simple;
          }
          catch (err) {
            console.log("Hit error", {err})
            return {"error": "API request failed"};
          }
        },
      },

      productVariants: {
        description: 'Return a list of all available variants on Amazon for a given parent product ID',
        parameters: z.object({
          productId: z.string().length(10),
        }),
        execute: async ({ productId }) => {
          try {
            const simple = await aiProductDetails("variants", "amazon", productId);
            console.log("Got response", {simple})
            return simple;
          }
          catch (err) {
            console.log("Hit error", {err})
            return {"error": "API request failed"};
          }
        },
      },

      productReviews: {
        description: 'Return a list of some interesting reviews for the given product',
        parameters: z.object({
          productId: z.string().length(10),
        }),
        execute: async ({ productId }) => {
          try {
            const simple = await aiProductDetails("reviews", "amazon", productId);
            console.log("Got response", {simple})
            return simple;
          }
          catch (err) {
            console.log("Hit error", {err})
            return {"error": "API request failed"};
          }
        },
      },

      productPurchase: {
        description: 'Buy a product from Amazon only after searching',
        parameters: z.object({
          products: z.array(z.string().length(10)).length(1),
          shipping_address: z.string(),
        }),
        execute: async ({ products, shipping_address }) => {
          try {
            const result: any = {};
            const zincAddr = await parseAndValidateAddress(shipping_address);
            if (zincAddr.error) {
              return Object.assign(result, {success: false, error: "address_error", details: zincAddr.error});
            }
            result.shipping_address = zincAddr;
            console.log(`Would buy ${products} to ${zincAddr}`);
            return Object.assign(result, {success: "pending", note: "Purchase in progress (demo mode, not live)"})
          } catch (err) {
            console.log("productPurchase error", {err})
            return Object.assign(result, { error: "exception", details: "" +err})
          }
        },
      },
    },

    onFinish: async ({ responseMessages }) => {
      try {
        const responseMessagesWithoutIncompleteToolCalls =
          sanitizeResponseMessages(responseMessages);

        await saveChat({
          id,
          messages: [
            ...coreMessages,
            ...responseMessagesWithoutIncompleteToolCalls,
          ],
        });
      } catch (error) {
        console.error('Failed to save chat');
      }

      streamingData.close();
    },
    experimental_telemetry: {
      isEnabled: true,
      functionId: 'stream-text',
    },
  });

  return result.toDataStreamResponse({
    data: streamingData,
  });
}
