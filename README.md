npm run verify -w @blog/blog-builder

npm run build -w @blog/blog-builder

node packages/blog-builder/dist/blog-builder.js ./docs

npm test -w packages/blog-viewer 2>&1

npm run verify -w @blog/blog-viewer

npm run build -w @blog/blog-viewer