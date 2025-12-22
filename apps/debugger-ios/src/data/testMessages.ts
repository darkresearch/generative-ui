export type Message = {
  id: string;
  messageNumber: number;
  role: 'user' | 'assistant';
  content: string;
  isStreaming?: boolean;
};

// Test messages with embedded message numbers for debugging
// [MSG #X] prefix helps verify correct content is rendered
export const INITIAL_MESSAGES: Message[] = [
  {
    id: '1',
    messageNumber: 1,
    role: 'user',
    content: '[MSG #1] Show me some images!',
  },
  {
    id: '2',
    messageNumber: 2,
    role: 'assistant',
    content: `[MSG #2] Here are images with different aspect ratios:

**Wide (2:1):**
![Wide](https://picsum.photos/seed/wide/600/300)

**Square (1:1):**
![Square](https://picsum.photos/seed/square/400/400)

**Tall (3:4):**
![Tall](https://picsum.photos/seed/tall/300/400)

All should display at their correct aspect ratios!`,
  },
  {
    id: '3',
    messageNumber: 3,
    role: 'user',
    content: '[MSG #3] What is React Native?',
  },
  {
    id: '4',
    messageNumber: 4,
    role: 'assistant',
    content: `[MSG #4] React Native

React Native is a **framework** for building native mobile apps using JavaScript and React.

**Key Features:**
- Cross-platform development
- Native performance
- Large ecosystem
- Hot reloading

![Sample 2](https://picsum.photos/seed/msg4/400/250)

It was created by Facebook and is now used by many companies.`,
  },
  {
    id: '5',
    messageNumber: 5,
    role: 'user',
    content: '[MSG #5] Tell me more',
  },
  {
    id: '6',
    messageNumber: 6,
    role: 'assistant',
    content: `[MSG #6] More Details

Here's another image:

![Sample 3](https://picsum.photos/seed/msg6/400/180)

And some code:

\`\`\`typescript
function hello() {
  console.log("Hello, world!");
}
\`\`\``,
  },
  {
    id: '7',
    messageNumber: 7,
    role: 'user',
    content: '[MSG #7] Show more images',
  },
  {
    id: '8',
    messageNumber: 8,
    role: 'assistant',
    content: `[MSG #8] Images below:

![Sample 4](https://picsum.photos/seed/msg8a/400/220)

More content here with **bold** and *italic* text.

![Sample 5](https://picsum.photos/seed/msg8b/400/200)`,
  },
  {
    id: '9',
    messageNumber: 9,
    role: 'user',
    content: '[MSG #9] One more please',
  },
  {
    id: '10',
    messageNumber: 10,
    role: 'assistant',
    content: `[MSG #10] Final Image

![Sample 6](https://picsum.photos/seed/msg10/400/240)

That's all the images!`,
  },
  {
    id: '11',
    messageNumber: 11,
    role: 'user',
    content: '[MSG #11] What about state management?',
  },
  {
    id: '12',
    messageNumber: 12,
    role: 'assistant',
    content: `[MSG #12] State Management in React Native

There are several popular options:

**Built-in:**
- \`useState\` - Simple local state
- \`useReducer\` - Complex local state
- \`Context API\` - Prop drilling solution

**Third-party libraries:**

1. **Redux** - The classic choice
   - Predictable state
   - Great devtools
   - Large ecosystem

2. **Zustand** - Modern and simple
   - Minimal boilerplate
   - TypeScript friendly
   - Small bundle size`,
  },
  {
    id: '13',
    messageNumber: 13,
    role: 'user',
    content: '[MSG #13] And navigation?',
  },
  {
    id: '14',
    messageNumber: 14,
    role: 'assistant',
    content: `[MSG #14] Navigation

**Example Setup:**

\`\`\`typescript
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

const Stack = createStackNavigator();

function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Details" component={DetailsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
\`\`\``,
  },
];

// Streaming demo content for new messages
export const STREAMING_RESPONSE = `[MSG #NEW] Great question!

Here's what I think about that:

**Key Points:**
- First, consider your use case
- Then evaluate the trade-offs
- Finally, prototype and test

The most important thing is to **start building** and iterate from there.

Don't let analysis paralysis hold you back!`;

// Helper to create a new message with proper numbering
export function createUserMessage(content: string, existingCount: number): Message {
  const num = existingCount + 1;
  return {
    id: Date.now().toString(),
    messageNumber: num,
    role: 'user',
    content: `[MSG #${num}] ${content}`,
  };
}

export function createAssistantMessage(existingCount: number): Message {
  const num = existingCount + 1;
  return {
    id: (Date.now() + 1).toString(),
    messageNumber: num,
    role: 'assistant',
    content: '',
    isStreaming: true,
  };
}
