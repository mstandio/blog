import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { BuilderConfig } from './utils/Model.ts';
import { ConsumerDigest } from './utils/ConsumerDigest.ts';
import { ConsumerTags } from './utils/ConsumerTags.ts';
import { ConsumerTimeline } from './utils/ConsumerTimeline.ts';
import { traverse } from './utils/Traverse.ts';
import { WriterJson } from './utils/WriterJson.ts';

export function buildBlog(inputDir: string, outputDir: string = inputDir): void {
    const configPath = join(inputDir, 'blog-builder-config.json');
    if (!existsSync(configPath)) {
        throw new Error(`blog-builder-config.json not found in inputDir: ${inputDir}`);
    }

    const config: BuilderConfig = JSON.parse(readFileSync(configPath, 'utf-8'));
    const writer = new WriterJson(outputDir);

    const consumers = [
        new ConsumerDigest(config),
        new ConsumerTimeline(writer, config),
        new ConsumerTags(writer, config),
    ];

    traverse(inputDir, consumers);
}
