
import { describe, test, expect } from 'bun:test';
import { fixIncompleteMarkdown } from '../parseIncomplete';

describe('Repro Markdown Preservation', () => {
    test('repro failure', () => {
        // Based on the failure, it seems like some markdown is being modified.
        // I'll try a few cases that might be problematic.

        const cases = [
            "**bold**",
            "*italic*",
            "`code`",
            "** bold with spaces **",
            "* italic with spaces *",
            "` code with spaces `"
        ];

        cases.forEach(md => {
            const result = fixIncompleteMarkdown(md);
            console.log(`Input: '${md}', Output: '${result}'`);
            expect(result).toBe(md);
        });
    });
});
