import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it, vi } from 'vitest';
import type { BuilderConfig, Page, Writer } from '../utils/Model.ts';
import { ConsumerTags } from '../utils/ConsumerTags.ts';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SAMPLE_POSTS = join(__dirname, 'sample-posts');

describe('ConsumerTags', () => {
    const config: BuilderConfig = JSON.parse(
        readFileSync(join(SAMPLE_POSTS, 'expected-full', 'blog-builder-config.json'), 'utf-8'),
    );

    it('writes tag page when posts-per-page is reached for a given tag', () => {
        // given
        const mockWriter: Writer = { write: vi.fn() };
        const consumer = new ConsumerTags(mockWriter, config);
        const dir1 = join(SAMPLE_POSTS, '251013-some-description');  // tags: blue, green, red
        const dir2 = join(SAMPLE_POSTS, '251014-some-other-description');  // tags: red
        const expectedPage: Page = JSON.parse(
            readFileSync(join(SAMPLE_POSTS, 'expected-full', 'blog-builder-tag_red-page1.json'), 'utf-8'),
        );

        // when
        consumer.consume(dir1);
        consumer.consume(dir2);

        // then — only "red" reaches posts-per-page of 2; blue and green each have 1 post (not yet written)
        expect(mockWriter.write).toHaveBeenCalledOnce();
        const [filename, content] = (mockWriter.write as ReturnType<typeof vi.fn>).mock.calls[0] as [string, string];
        expect(filename).toBe('blog-builder-tag_red-page1.json');
        expect(JSON.parse(content)).toEqual(expectedPage);
    });
});
