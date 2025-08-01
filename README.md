# Michael's Professional Portfolio

🤖 **Built with AI & Windsurf** - This portfolio was developed using AI-powered development tools and the Windsurf IDE, showcasing modern AI-assisted software development practices.

This repository contains the source code for my personal portfolio website, designed to showcase my skills, professional experience, and project work. The site features a modern, clean, neobrutalist aesthetic and is fully responsive across all devices.

## Tech Stack

This project is built with a modern, robust, and scalable tech stack:

- **Framework:** [Next.js](https://nextjs.org/) 15
- **UI:** [React](https://react.dev/) 19
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/) 4
- **Testing:** [Jest](https://jestjs.io/) & [React Testing Library](https://testing-library.com/)
- **Deployment:** [Cloudflare Pages](https://pages.cloudflare.com/)
- **AI Integration:** [Hugging Face](https://huggingface.co/) API with local LM Studio fallback

## Features

### 🤖 AI-Powered Chatbot

The portfolio includes an intelligent chatbot that can answer questions about my professional experience, skills, and background. Key features:

- **Smart AI Assistant**: Powered by Hugging Face's DeepSeek model with advanced reasoning capabilities
- **Local Fallback**: Seamless fallback to local LM Studio API when cloud quota is exceeded
- **Safari Compatible**: Optimized for all browsers including Safari with proper caching headers
- **Responsive Design**: Works seamlessly on both desktop and mobile devices
- **Natural Conversations**: Ask questions like "Where did Michael work in 2023?" or "What are his technical skills?"

The chatbot uses advanced prompt engineering and context extraction to provide accurate, helpful responses about my professional background while maintaining a friendly, conversational tone.

## Getting Started

To run this project locally, follow these steps.

### Prerequisites

Make sure you have [Node.js](https://nodejs.org/en) and [pnpm](https://pnpm.io/installation) installed on your machine.

### Installation

1.  Clone the repository to your local machine:

    ```bash
    git clone https://github.com/michaelfried-dev/my-portfolio-windowed.git
    cd my-portfolio-windowed
    ```

2.  Install the project dependencies:
    ```bash
    pnpm install
    ```

### Running the Development Server

Once the dependencies are installed, you can start the local development server:

```bash
pnpm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the result.

## Testing

This project is configured with Jest for unit and component testing. To run the complete test suite, use the following command:

```bash
pnpm test
```

To run the tests and view a code coverage report, run:

```bash
pnpm test:cov
```
