export const PRESETS = {
  headers: '# H1\n## H2\n### H3\n#### H4\n##### H5\n###### H6',
  emphasis: 'Normal *italic* **bold** ***both*** ~~strike~~',
  code_block: '```typescript\nconst x: number = 1;\nconsole.log(x);\n```',
  lists: '- Item 1\n- Item 2\n  - Nested\n\n1. First\n2. Second',
  table: '| Name | Age |\n|------|-----|\n| Alice | 30 |\n| Bob | 25 |',
  blockquote: '> This is a quote\n> spanning multiple lines',
  incomplete_bold: 'This is **bold but never clo',
  incomplete_code: '```javascript\nconst x = 1\n// no closing fence',
  incomplete_link: 'Check out [this link](https://exa',
  component: 'Here is a button:\n\n[{c:"Button",p:{"label":"Click"}}]\n\nMore text.',
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

[{c:"Button",p:{"label":"Click me"}}]

That's all folks!
`,
} as const;

