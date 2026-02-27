import { basename } from 'node:path';
import type { Consumer, Logger } from './Model.ts';

export class ConsumerLogger implements Consumer {
    private readonly logger: Logger;

    constructor(logger: Logger = console) {
        this.logger = logger;
    }

    consume(dirPath: string): void {
        this.logger.log(basename(dirPath));
    }
}
