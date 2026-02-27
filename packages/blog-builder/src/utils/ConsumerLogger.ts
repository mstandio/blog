import { basename } from 'node:path';
import type { Consumer } from './Traverse.ts';

interface Logger {
    log: (message: string) => void;
}

export class ConsumerLogger implements Consumer {
    private readonly logger: Logger;

    constructor(logger: Logger = console) {
        this.logger = logger;
    }

    consume(dirPath: string): void {
        this.logger.log(basename(dirPath));
    }
}
