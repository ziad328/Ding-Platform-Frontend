// Mock AI responses pool for Noro Chat simulation
export interface MockResponse {
  content: string;
  suggestions: string[];
}

export const MOCK_RESPONSES: MockResponse[] = [
  {
    content: `## Great question! Here's what I found 🌟

I can help you with a wide variety of tasks. Here are some things I'm good at:

- **Writing & Editing** — drafting emails, essays, creative stories, and more
- **Coding** — debugging, explaining concepts, generating boilerplate
- **Research** — summarizing topics, comparing options, fact-checking
- **Planning** — trip planning, project outlines, daily schedules

**Example code snippet:**
\`\`\`javascript
function greet(name) {
  return \`Hello, \${name}! Welcome to Noro.\`;
}
\`\`\`

Feel free to ask me anything — I'm here to help!`,
    suggestions: ['Tell me more', 'Show me an example', 'How does this work?'],
  },
  {
    content: `That's a fascinating topic! Let me break it down for you:

### Key Points

1. **First**, it's important to understand the context
2. **Second**, we need to consider the implications
3. **Finally**, let's think about practical applications

The core idea is that *every complex problem can be simplified* when approached systematically. Starting with the fundamentals always makes the bigger picture clearer.

> "The secret of getting ahead is getting started." — Mark Twain

Would you like me to go deeper on any of these points?`,
    suggestions: ['Go deeper', 'Give me an example', 'Summarize this'],
  },
  {
    content: `Here's a concise summary of what you're asking about:

The concept revolves around three main pillars:

- **Efficiency** — doing more with less
- **Clarity** — communicating ideas simply
- **Impact** — measuring what matters

I can elaborate on any of these or we can explore a completely different angle. What direction would be most helpful for you?`,
    suggestions: ['Elaborate on efficiency', 'Change the angle', 'Perfect, thanks!'],
  },
  {
    content: `I've analyzed your request carefully. Here's my take:

\`\`\`typescript
// A clean solution to your problem
interface Solution {
  approach: string;
  complexity: 'O(n)' | 'O(log n)' | 'O(1)';
  tradeoffs: string[];
}

const bestSolution: Solution = {
  approach: 'Divide and conquer',
  complexity: 'O(log n)',
  tradeoffs: ['More memory', 'Easier to reason about'],
};
\`\`\`

This approach gives you **logarithmic time complexity**, which is excellent for large datasets. The trade-off is slightly higher memory usage, but for most real-world scenarios this is absolutely worth it.`,
    suggestions: ['Explain the trade-offs', 'Show alternative', 'How do I implement this?'],
  },
  {
    content: `Absolutely! Let me walk you through this step by step.

### Step 1: Understanding the Problem
Before jumping into solutions, it's crucial to fully understand what we're trying to solve. This means:
- Defining the *inputs* and *outputs* clearly
- Identifying any *constraints* or *edge cases*
- Understanding the *performance requirements*

### Step 2: Planning the Solution
Once the problem is clear, we can start planning:
- Break the problem into smaller sub-problems
- Choose the right data structures
- Consider time and space complexity

### Step 3: Implementation
Now we can write the code with confidence. Always remember to:
- Write clean, readable code
- Add meaningful comments
- Test edge cases

**Need help with any specific step?** Just let me know!`,
    suggestions: ['Help with Step 1', 'Show code example', 'What are edge cases?'],
  },
];

export const WELCOME_SUGGESTIONS = [
  {
    icon: '✍️',
    title: 'Help me write',
    subtitle: 'Draft an email, essay, or story',
    prompt: 'Help me write a professional email to my team about an upcoming deadline.',
  },
  {
    icon: '🔍',
    title: 'Explain something',
    subtitle: 'Break down complex topics',
    prompt: 'Explain quantum computing in simple terms that anyone can understand.',
  },
  {
    icon: '💡',
    title: 'Brainstorm ideas',
    subtitle: 'Generate creative solutions',
    prompt: 'Give me 5 creative ideas for a mobile app that helps people build healthy habits.',
  },
  {
    icon: '🐛',
    title: 'Debug my code',
    subtitle: 'Find and fix issues',
    prompt: 'Help me debug this issue: my React component is re-rendering infinitely.',
  },
];

export function getRandomResponse(): MockResponse {
  return MOCK_RESPONSES[Math.floor(Math.random() * MOCK_RESPONSES.length)];
}
