import { omit } from "lodash-es";
import { z } from "zod";
import zodToJsonSchemaImpl from 'zod-to-json-schema';

import type { TabItem } from "./categories";

function zodToJsonSchema(schema: z.ZodType) {
  return omit(
    zodToJsonSchemaImpl(schema, { $refStrategy: 'none' }),
    '$ref',
    '$schema',
    'default',
    'definitions',
    'description',
    'markdownDescription',
  );
}

const SetTabCategoriesSchema = z.object({
  categories: z.array(z.object({
    name: z.string().describe('The name or title of the category.'),
    tabs: z.array(z.number()).describe('A list of all Tab IDs that belong to this category.'),
  })),
});

export const analyzeTabs = async (apiKey: string, tabs: TabItem[]): Promise<Record<string, number[]>> => {
  try {
    // send the request containing the messages to the OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        temperature: 0.75,
        messages: [
          {
            "role": "system",
            "content": `
You are a browser tab categorizer.
You will be given a list of tabs, each with a domain and their title.
Organize the whole list of tabs into groups based on their topic.
Do not be too broad or generic.
Weigh the tab domains more into consideration than their title.
In case many tabs share the same domain, find individual topics.
Limit yourself to eight categories maximum.
In case a tab is too miscellaneous, use "Other".
            `,
          },
          {
            "role": "user",
            "content": JSON.stringify(tabs),
          }
        ],
        function_call: {
          name: 'set_tab_categories',
        },
        functions: [
          {
            name: 'set_tab_categories',
            description: 'Moves all tabs into given categories.',
            parameters: zodToJsonSchema(SetTabCategoriesSchema),
          },
        ],
      })
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch. Status code: ${response.status}`);
    }

    // Get the data from the API response as parsed schema
    const data = await response.json();
    const calledFuntionRaw = data.choices[0]?.message?.function_call?.arguments ?? '';
    const calledFunction = SetTabCategoriesSchema.parse(JSON.parse(calledFuntionRaw));

    // Return a mapping of category name to tab ID list
    return calledFunction.categories.reduce((acc, category) => {
      acc[category.name] = category.tabs;
      return acc;
    }, {} as Record<string, number[]>);
  } catch (error) {
    console.error(error);
  }

  return {};
};
