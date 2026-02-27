import { readdirSync } from 'node:fs';
import { join } from 'node:path';

export interface Consumer {
    consume(dirPath: string): void;
}

export function traverse(rootDir: string, consumers: Consumer[]): void {
    const entries = readdirSync(rootDir, { withFileTypes: true });
    const qualifying = entries
        .filter((entry) => entry.isDirectory() && /^\d{6}-/.test(entry.name))
        .sort((a, b) => a.name.localeCompare(b.name));

    for (const entry of qualifying) {
        const fullPath = join(rootDir, entry.name);
        for (const consumer of consumers) {
            consumer.consume(fullPath);
        }
    }
}
