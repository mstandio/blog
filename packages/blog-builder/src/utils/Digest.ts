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

export class Digest {
    private readonly logger: Logger;

    constructor(logger: Logger = console) {
        this.logger = logger;
    }

    process(filePath: string): Partial<PostMetadata> {
        this.logger.log(filePath);
        return {};
    }
}
