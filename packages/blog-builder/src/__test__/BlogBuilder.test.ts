import { existsSync, rmSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterAll, describe, expect, it } from 'vitest';
import { buildBlog } from '../BlogBuilder.ts';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SAMPLE_POSTS = join(__dirname, 'sample-posts');
const TMP = join(__dirname, 'tmp');

const OUTPUT_FILES = [
    'blog-builder-timeline-page1.json',
    'blog-builder-timeline-page2.json',
    'blog-builder-tag_red-page1.json',
    'blog-builder-tag_red-page2.json',
    'blog-builder-tag_blue-page1.json',
    'blog-builder-tag_green-page1.json',
];

describe('BlogBuilder', () => {
    afterAll(() => {
        for (const file of OUTPUT_FILES) {
            rmSync(join(TMP, file), { force: true });
        }
    });

    it('generates all expected output files in outputDir when run against sample-posts', () => {
        // when
        buildBlog(SAMPLE_POSTS, TMP);

        // then
        for (const file of OUTPUT_FILES) {
            expect(existsSync(join(TMP, file)), `expected ${file} to exist in tmp`).toBe(true);
        }
    });
});
