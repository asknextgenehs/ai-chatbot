const result = await streamUI({
  model: openai('g-nnlQKy6Ai-ehs-incident-investigations'), // Your custom GPT model
  initial: <SpinnerMessage />,
  system: `\
  You are a highly skilled Environmental Health and Safety (EHS) professional with expertise in accident and incident investigations. 
  Your role is to guide users through the investigation process, step-by-step, ensuring that all relevant details are collected and analyzed to determine root causes and corrective actions.

  You will:
  - Collect incident details (What happened, where, when, and who was involved).
  - Assist users in gathering evidence such as witness statements, photographs, and equipment logs.
  - Provide guidance on performing root cause analysis using techniques like the 5 Whys or Fishbone Diagram.
  - Recommend immediate corrective actions to prevent future incidents.
  - Help generate a report that summarizes the investigation findings and includes an action plan.

  Ask for clarification or more details if necessary, and ensure each step is completed thoroughly before moving on to the next.`,
  messages: [
    ...aiState.get().messages.map((message: any) => ({
      role: message.role,
      content: message.content,
      name: message.name
    }))
  ],
  text: ({ content, done, delta }) => {
    if (!textStream) {
      textStream = createStreamableValue('')
      textNode = <BotMessage content={textStream.value} />
    }

    if (done) {
      textStream.done()
      aiState.done({
        ...aiState.get(),
        messages: [
          ...aiState.get().messages,
          {
            id: nanoid(),
            role: 'assistant',
            content
          }
        ]
      })
    } else {
      textStream.update(delta)
    }

    return textNode
  },
  tools: {
    gatherEvidence: {
      description: 'Guide the user in gathering evidence such as photos, witness statements, and equipment logs.',
      parameters: z.object({
        evidenceType: z.enum(['photo', 'witness statement', 'log']).describe('Type of evidence to gather.'),
        description: z.string().describe('Brief description of the evidence.')
      }),
      generate: async function* ({ evidenceType, description }) {
        // Replace stock-related logic with investigation-related actions
        yield (
          <BotMessage content={`Please gather the following evidence: ${evidenceType}. Details: ${description}.`} />
        );
      }
    },
    rootCauseAnalysis: {
      description: 'Assist the user in conducting a root cause analysis using the 5 Whys method.',
      parameters: z.object({
        incidentDetails: z.string().describe('Details of the incident to analyze.')
      }),
      generate: async function* ({ incidentDetails }) {
        // Help the user perform a root cause analysis
        yield (
          <BotMessage content={`Let’s perform a root cause analysis. Starting with: ${incidentDetails}.`} />
        );
        await sleep(1000);
        yield (
          <BotMessage content="Why did this happen?" />
        );
      }
    },
    recommendCorrectiveActions: {
      description: 'Recommend corrective actions based on the investigation findings.',
      parameters: z.object({
        recommendations: z.array(z.string()).describe('List of corrective actions to recommend.')
      }),
      generate: async function* ({ recommendations }) {
        // Recommend corrective actions
        yield (
          <BotMessage content={`Based on the investigation, I recommend the following corrective actions: ${recommendations.join(', ')}.`} />
        );
      }
    }
  }
})
