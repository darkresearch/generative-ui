// Preset markdown examples
export const PRESETS = {
  Basic: `# Hello World

This is **bold text** and *italic text*.

Here's some \`inline code\` and a list:

- Item 1
- Item 2
- Item 3

## Code Block

\`\`\`javascript
function greet(name) {
  return \`Hello, \${name}!\`;
}
\`\`\`

> This is a blockquote

[Link to example](https://example.com)
`,

  Components: `# Token Analysis

Here's the current Bitcoin data:

{{c:"TokenCard",p:{"sym":"BTC","name":"Bitcoin","price":45000,"change":2.5}}}

The price has been **trending upward** recently.

You can also use buttons inline: {{c:"Button",p:{"label":"View Details","variant":"primary"}}}

And badges: {{c:"Badge",p:{"text":"New","color":"#494C53"}}}
`,

  Code: `# Smart Contract Example

Here's a simple Solidity contract:

\`\`\`solidity
pragma solidity ^0.8.0;

contract SimpleToken {
    mapping(address => uint256) public balances;
    
    function transfer(address to, uint256 amount) public {
        require(balances[msg.sender] >= amount, "Insufficient balance");
        balances[msg.sender] -= amount;
        balances[to] += amount;
    }
}
\`\`\`

And some Python:

\`\`\`python
def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n-1) + fibonacci(n-2)
\`\`\`
`,

  Tables: `# Data Table

| Token | Price | Change |
|-------|-------|--------|
| BTC   | $45,000 | +2.5% |
| ETH   | $3,200 | +1.8% |
| SOL   | $150 | -0.5% |

## More Complex Table

| Component | Status | Version |
|-----------|--------|---------|
| StreamdownRN | ✅ Active | 0.1.5 |
| CodeBlock | ✅ Active | Latest |
| TableWrapper | ✅ Active | Latest |
`,
};

export type PresetKey = keyof typeof PRESETS;

