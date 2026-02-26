import ImageKit from "@imagekit/nodejs";

// @imagekit/nodejs v7 only takes privateKey in ClientOptions.
// publicKey and urlEndpoint are no longer constructor options;
// the SDK automatically uses the ImageKit REST API base URL.
const imagekit = new ImageKit({
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY || "YOUR_IMAGEKIT_PRIVATE_KEY",
});

export default imagekit;
