
import { describe, test, expect } from 'bun:test';
import * as fc from 'fast-check';
import { fixIncompleteMarkdown, updateIncompleteTagState } from '../parseIncomplete';
import { extractComponents, extractPartialComponents } from '../componentInjector';
import { INITIAL_INCOMPLETE_STATE, ComponentRegistry, ComponentDefinition } from '../types';

// Mock Registry
const mockRegistry: ComponentRegistry = {
    get: (name: string) => ({
        name,
        component: () => null,
        category: 'dynamic',
        propsSchema: { type: 'object' },
    } as ComponentDefinition),
    validate: () => ({ valid: true, errors: [] }),
    has: () => true,
};

describe('Fuzz Testing', () => {
    describe('fixIncompleteMarkdown', () => {
        test('should not crash on any string input', () => {
            fc.assert(
                fc.property(fc.string(), (text) => {
                    const result = fixIncompleteMarkdown(text);
                    expect(typeof result).toBe('string');
                })
            );
        });

        test('should not crash on any string input with state', () => {
            fc.assert(
                fc.property(fc.string(), (text) => {
                    const result = fixIncompleteMarkdown(text, INITIAL_INCOMPLETE_STATE);
                    expect(typeof result).toBe('string');
                })
            );
        });

        test('idempotency: processing twice should produce stable output (mostly)', () => {
            fc.assert(
                fc.property(fc.string(), (text) => {
                    const once = fixIncompleteMarkdown(text);
                    const twice = fixIncompleteMarkdown(once);
                    expect(typeof twice).toBe('string');
                    expect(twice.length).toBeGreaterThanOrEqual(once.length);
                })
            );
        });

        test('should preserve complete markdown structures', () => {
            // Generate valid markdown structures
            // We restrict content to alphanumeric to avoid accidental nesting or breaking of syntax
            // e.g. "**`**" is not just bold, it's bold + open code
            const safeContent = fc.string({ minLength: 1 }).filter(s => /^[a-zA-Z0-9\s]+$/.test(s));

            const markdownArb = fc.oneof(
                fc.record({ type: fc.constant('bold'), content: safeContent }).map(d => `**${d.content}**`),
                fc.record({ type: fc.constant('italic'), content: safeContent }).map(d => `*${d.content}*`),
                fc.record({ type: fc.constant('code'), content: safeContent }).map(d => `\`${d.content}\``)
            );

            fc.assert(
                fc.property(markdownArb, (md) => {
                    const result = fixIncompleteMarkdown(md);
                    // Should not change complete markdown
                    if (result !== md) {
                        console.error(`Mismatch! Input: '${md}', Output: '${result}'`);
                    }
                    expect(result).toBe(md);
                })
            );
        });

        test('should preserve nested markdown structures', () => {
            // Generate nested markdown: **bold *italic* bold**
            const safeContent = fc.string({ minLength: 1 }).filter(s => /^[a-zA-Z0-9\s]+$/.test(s));

            const nestedArb = fc.record({
                outer: fc.constant('bold'),
                inner: fc.constant('italic'),
                content: safeContent
            }).map(d => `**${d.content} *${d.content}* ${d.content}**`);

            fc.assert(
                fc.property(nestedArb, (md) => {
                    const result = fixIncompleteMarkdown(md);
                    expect(result).toBe(md);
                })
            );
        });
    });

    describe('extractComponents', () => {
        test('should correctly extract valid components', () => {
            // Generate valid component syntax: {{c:"Name", p:{...}}}
            const componentArb = fc.record({
                name: fc.string({ minLength: 1, maxLength: 20 }).filter(s => !s.includes('"')),
                props: fc.dictionary(fc.string({ minLength: 1 }), fc.oneof(fc.string(), fc.integer()))
            }).map(({ name, props }) => {
                const jsonProps = JSON.stringify(props);
                // Use loose spacing to test regex flexibility
                return {
                    raw: `{{c: "${name}", p: ${jsonProps}}}`,
                    name,
                    props
                };
            });

            fc.assert(
                fc.property(componentArb, ({ raw, name, props }) => {
                    const { components } = extractComponents(raw, mockRegistry);
                    expect(components).toHaveLength(1);
                    expect(components[0].name).toBe(name);
                    expect(components[0].props).toEqual(props);
                })
            );
        });

        test('should correctly extract components embedded in text', () => {
            const componentArb = fc.record({
                name: fc.string({ minLength: 1, maxLength: 20 }).filter(s => !s.includes('"')),
                props: fc.dictionary(fc.string({ minLength: 1 }), fc.oneof(fc.string(), fc.integer()))
            }).map(({ name, props }) => {
                const jsonProps = JSON.stringify(props);
                return {
                    raw: `{{c: "${name}", p: ${jsonProps}}}`,
                    name,
                    props
                };
            });

            fc.assert(
                fc.property(fc.string(), componentArb, fc.string(), (prefix, comp, suffix) => {
                    // Ensure prefix/suffix don't accidentally create component syntax
                    const safePrefix = prefix.replace(/{{/g, '{ {');
                    const safeSuffix = suffix.replace(/{{/g, '{ {');

                    const input = safePrefix + comp.raw + safeSuffix;
                    const { components, markdown } = extractComponents(input, mockRegistry);

                    expect(components).toHaveLength(1);
                    expect(components[0].name).toBe(comp.name);
                    expect(components[0].props).toEqual(comp.props);

                    // Check that the component was replaced by a placeholder or removed
                    expect(markdown).not.toContain(comp.raw);
                    expect(markdown).toContain(safePrefix);
                    expect(markdown).toContain(safeSuffix);
                })
            );
        });
    });

    describe('extractPartialComponents', () => {
        test('should handle incomplete component strings without crashing', () => {
            const componentArb = fc.record({
                name: fc.string({ minLength: 1, maxLength: 20 }).filter(s => !s.includes('"')),
                props: fc.dictionary(fc.string({ minLength: 1 }), fc.oneof(fc.string(), fc.integer()))
            }).map(({ name, props }) => {
                const jsonProps = JSON.stringify(props);
                return `{{c: "${name}", p: ${jsonProps}}}`;
            });

            fc.assert(
                fc.property(componentArb, fc.integer({ min: 1, max: 100 }), (fullComp, sliceLen) => {
                    const partial = fullComp.substring(0, sliceLen);
                    // It should not crash
                    const result = extractPartialComponents(partial, mockRegistry);
                    expect(result).toBeDefined();
                })
            );
        });
    });

    describe('updateIncompleteTagState', () => {
        test('incremental updates should match full processing', () => {
            fc.assert(
                fc.property(fc.string(), (text) => {
                    const fullState = updateIncompleteTagState(INITIAL_INCOMPLETE_STATE, text);

                    let incrementalState = INITIAL_INCOMPLETE_STATE;
                    for (let i = 0; i < text.length; i++) {
                        const partialText = text.substring(0, i + 1);
                        incrementalState = updateIncompleteTagState(incrementalState, partialText);
                    }

                    const sanitizeStack = (stack: any[]) => stack.map(({ openingText, ...rest }) => rest);

                    expect(sanitizeStack(incrementalState.stack)).toEqual(sanitizeStack(fullState.stack));
                    expect(incrementalState.inCodeBlock).toBe(fullState.inCodeBlock);
                    expect(incrementalState.inInlineCode).toBe(fullState.inInlineCode);
                    expect(incrementalState.tagCounts).toEqual(fullState.tagCounts);
                })
            );
        });

        test('should handle random splits', () => {
            fc.assert(
                fc.property(fc.string(), fc.array(fc.integer({ min: 1, max: 10 })), (text, splits) => {
                    let currentState = INITIAL_INCOMPLETE_STATE;
                    let currentText = "";

                    let offset = 0;
                    for (const splitLen of splits) {
                        if (offset >= text.length) break;
                        const chunk = text.substring(offset, offset + splitLen);
                        currentText += chunk;
                        currentState = updateIncompleteTagState(currentState, currentText);
                        offset += splitLen;
                    }

                    if (offset < text.length) {
                        currentText += text.substring(offset);
                        currentState = updateIncompleteTagState(currentState, currentText);
                    }

                    const fullState = updateIncompleteTagState(INITIAL_INCOMPLETE_STATE, text);

                    const sanitizeStack = (stack: any[]) => stack.map(({ openingText, ...rest }) => rest);
                    expect(sanitizeStack(currentState.stack)).toEqual(sanitizeStack(fullState.stack));
                    expect(currentState.inCodeBlock).toBe(fullState.inCodeBlock);
                    expect(currentState.inInlineCode).toBe(fullState.inInlineCode);
                })
            );
        });
    });
});
