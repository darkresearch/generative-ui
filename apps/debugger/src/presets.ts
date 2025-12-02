/**
 * Stable presets - ready for release
 * These work with single generative components
 */
export const STABLE_PRESETS = {
  // Basic markdown
  headers: '# H1\n## H2\n### H3\n#### H4\n##### H5\n###### H6',
  emphasis: 'Normal *italic* **bold** ***both*** ~~strike~~',
  code_block: '```typescript\nconst x: number = 1;\nconsole.log(x);\n```',
  lists: '- Item 1\n- Item 2\n  - Nested\n\n1. First\n2. Second',
  table: '| Name | Age |\n|------|-----|\n| Alice | 30 |\n| Bob | 25 |',
  blockquote: '> This is a quote\n> spanning multiple lines',
  
  // Incomplete markdown (streaming edge cases)
  incomplete_bold: 'This is **bold but never clo',
  incomplete_code: '```javascript\nconst x = 1\n// no closing fence',
  incomplete_link: 'Check out [this link](https://exa',
  
  // Single component (WORKING)
  component: `Here is a status card:

[{c:"StatusCard",p:{"title":"On-call","description":"Pager rotation for week 42","priority":1,"tickets":7}}]

More text.`,

  // Streaming skeleton demo - watch the skeleton fill in as props stream
  streaming_skeleton: `Watch the skeleton fill in:

[{c:"StatusCard",p:{"title":"Project Alpha","description":"Q4 roadmap planning and sprint retrospective","priority":2,"tickets":15}}]

The component above streams with skeleton placeholders!`,

  // Kitchen sink
  kitchen_sink: `# Streamdown Test

## Introduction
This is **bold** and *italic* text.

### Code Example
\`\`\`typescript
interface User {
  name: string;
  age: number;
}

const greet = (user: User) => {
  console.log(\`Hello, \${user.name}!\`);
};
\`\`\`

### Lists

- First item
- Second item
  - Nested item

1. Ordered first
2. Ordered second

### Table

| Feature | Status |
|---------|--------|
| Headers | ✅ |
| Code | ✅ |
| Tables | ✅ |

> This is a blockquote
> with multiple lines

---

### Component Demo

[{c:"StatusCard",p:{"title":"Sprint 42","description":"Feature development and bug fixes","priority":2,"tickets":12}}]

That's all folks!
`,
} as const;

/**
 * Experimental presets - NOT ready for release
 * These require nested components / canvas support which is incomplete
 */
export const EXPERIMENTAL_PRESETS = {
  // Nested components demo
  nested_layout: `A card with nested content:

[{c:"Card",p:{"title":"Dashboard"},children:[
  {c:"Stack",p:{"gap":12},children:[
    {c:"StatusCard",p:{"title":"Active Tasks","description":"Current sprint items","priority":1,"tickets":8}},
    {c:"StatusCard",p:{"title":"Backlog","description":"Upcoming work items","priority":3,"tickets":23}}
  ]}
]}]

Nested components render recursively!`,

  // Stack layout demo
  stack_layout: `Horizontal and vertical stacks:

[{c:"Stack",p:{"direction":"column","gap":16},children:[
  {c:"Card",p:{"title":"First Card"},children:[]},
  {c:"Stack",p:{"direction":"row","gap":8},children:[
    {c:"StatusCard",p:{"title":"Left","priority":1,"tickets":5}},
    {c:"StatusCard",p:{"title":"Right","priority":2,"tickets":10}}
  ]}
]}]`,

  // Canvas layout demo - CSS Grid-like 2D layouts
  canvas_layout: `A 2-column canvas layout:

[{c:"Canvas",p:{"style":{"gridTemplateColumns":"1fr 1fr","gap":12}},children:[
  {c:"StatusCard",p:{"title":"Full Width Header","description":"This spans both columns","priority":1,"tickets":42},style:{"gridColumn":"span 2"}},
  {c:"StatusCard",p:{"title":"Left Column","description":"Half width","priority":2,"tickets":15}},
  {c:"StatusCard",p:{"title":"Right Column","description":"Half width","priority":3,"tickets":8}},
  {c:"Card",p:{"title":"Another Full Width"},style:{"gridColumn":"span 2"}}
]}]

The Canvas uses CSS Grid-like syntax!`,

  // Dashboard canvas demo
  canvas_dashboard: `Dashboard with mixed layouts:

[{c:"Canvas",p:{"style":{"gridTemplateColumns":"2fr 1fr","gap":16,"padding":12}},children:[
  {c:"StatusCard",p:{"title":"Main Panel","description":"Takes 2/3 of the width with important information","priority":1,"tickets":100}},
  {c:"Stack",p:{"direction":"column","gap":8},children:[
    {c:"StatusCard",p:{"title":"Side A","priority":2,"tickets":5}},
    {c:"StatusCard",p:{"title":"Side B","priority":3,"tickets":3}}
  ]},
  {c:"Card",p:{"title":"Footer Section"},style:{"gridColumn":"span 2"}}
]}]`,
} as const;

/**
 * Default presets export - includes only stable presets
 */
export const PRESETS = { ...STABLE_PRESETS } as const;
