export interface Post {
    title: string;
    teaser: string;
    date: string;
    url: string;
    tags: string[];
}

export interface PostMetadata {
    post: Post;
}

export interface BuilderConfig {
    'title-class': string;
    'teaser-class': string;
    'tag-class': string;
    'posts-per-page'?: number;
    'metadata-file': string;
}

export interface Logger {
    log: (message: string) => void;
}

export interface Consumer {
    consume(dirPath: string): void;
}

export interface Writer {
    write(fileName: string, content: string): void;
}

export interface Page {
    posts: Post[];
}
