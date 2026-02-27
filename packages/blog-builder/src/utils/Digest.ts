import { readFileSync } from 'node:fs';
import { basename, dirname } from 'node:path';
import { parse } from 'node-html-parser';

export interface PostMetadata {
    post: {
        title: string;
        teaser: string;
        date: string;
        url: string;
        tags: string[];
    };
}

export interface Logger {
    log: (message: string) => void;
}

export type FileReader = (filePath: string) => string;

export class Digest {
    private readonly logger: Logger;
    private readonly fileReader: FileReader;

    constructor(
        logger: Logger = console,
        fileReader: FileReader = (filePath) => readFileSync(filePath, 'utf-8'),
    ) {
        this.logger = logger;
        this.fileReader = fileReader;
    }

    process(filePath: string): PostMetadata {
        this.logger.log(filePath);

        const html = this.fileReader(filePath);
        const root = parse(html);

        const title = root.querySelector('.blog-builder-title')?.text.trim() ?? '';
        const teaser = root.querySelector('.blog-builder-teaser')?.text.trim() ?? '';
        const tags = root.querySelectorAll('.blog-builder-tag').map((el) => el.text.trim());

        const folderName = basename(dirname(filePath));
        const url = `/${folderName}`;
        const date = parseDateFromFolderName(folderName);

        return { post: { title, teaser, date, url, tags } };
    }
}

function parseDateFromFolderName(folderName: string): string {
    const match = /^(\d{2})(\d{2})(\d{2})/.exec(folderName);
    if (!match) return '';
    const [, yy, mm, dd] = match;
    return `20${yy}-${mm}-${dd}`;
}
