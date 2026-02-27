import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it, vi } from 'vitest';
import type { BuilderConfig, Page, Writer } from '../utils/Model.ts';
import { ConsumerTimeline } from '../utils/ConsumerTimeline.ts';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SAMPLE_POSTS = join(__dirname, 'sample-posts');

describe('ConsumerTimeline', () => {
    const config: BuilderConfig = JSON.parse(
        readFileSync(join(SAMPLE_POSTS, 'expected-full', 'blog-builder-config.json'), 'utf-8'),
    );

    it('writes page1 JSON after consuming two posts when posts-per-page is 2', () => {
        // given
        const mockWriter: Writer = { write: vi.fn() };
        const consumer = new ConsumerTimeline(mockWriter, config);
        const dir1 = join(SAMPLE_POSTS, '251013-some-description');
        const dir2 = join(SAMPLE_POSTS, '251014-some-other-description');
        const expectedPage: Page = JSON.parse(
            readFileSync(join(SAMPLE_POSTS, 'expected-full', 'blog-builder-timeline-page1.json'), 'utf-8'),
        );

        // when
        consumer.consume(dir1);
        consumer.consume(dir2);

        // then
        expect(mockWriter.write).toHaveBeenCalledOnce();
        const [filename, content] = (mockWriter.write as ReturnType<typeof vi.fn>).mock.calls[0] as [string, string];
        expect(filename).toBe('blog-builder-timeline-page1.json');
        expect(JSON.parse(content)).toEqual(expectedPage);
    });
});
