import { describe, it, expect, vi } from 'vitest';
import { Digest } from '../utils/Digest.ts';

describe('Digest', () => {
    describe('process', () => {
        it('logs the received file path', () => {
            // given
            const logger = { log: vi.fn() };
            const digest = new Digest(logger);
            const filePath = '/path/to/blog-builder-metadata.json';

            // when
            digest.process(filePath);

            // then
            expect(logger.log).toHaveBeenCalledWith(filePath);
        });
    });
});
