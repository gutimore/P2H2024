This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Project Overview

This project is a Retrieval-Augmented Generation (RAG) application that allows users to upload multiple PDF files as sources. Users can select the sources they want to retrieve answers from, providing a customized and dynamic knowledge retrieval experience. The chat interface was built using the [`chatscope`](https://github.com/chatscope) library, offering a seamless and interactive user experience.

In the background, this application utilizes the OpenAI API for generating responses. Additionally, the [`LangChain.js`](https://github.com/hwchase17/langchainjs) library was used to construct the underlying logic, enabling more advanced language processing and retrieval capabilities. Redis is used to implement the queue that processes multiple files in the backend, ensuring efficient handling of uploaded documents. ChatGPT responses are parsed using the [`react-markdown`](https://github.com/remarkjs/react-markdown) library to render formatted text correctly in the chat interface.

## Getting Started

First, ensure that you have the necessary environment variables set up:

- Define `NOTEBOOKLM_OPENAI_API_KEY` in your environment.
- Ensure you have a Redis instance running and listening on port `6379`.

Then, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
