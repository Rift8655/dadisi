# Next Entree

Next.js 14+ starter template with app router, shadcn/ui, typesafe env, icons and configs setup.

## Usage

1. Setup a project using the template

```bash
pnpm create next-app -e https://github.com/redpangilinan/next-entree
```

```bash
npx create-next-app -e https://github.com/redpangilinan/next-entree
```

```bash
yarn create next-app -e https://github.com/redpangilinan/next-entree
```

```bash
bunx create-next-app -e https://github.com/redpangilinan/next-entree
```

2. Copy `.env.example` to `.env.local`

```bash
cp .env.example .env.local
```

## Features

This template uses [shadcn](https://github.com/shadcn)'s Next.js app structure from [shadcn/ui](https://ui.shadcn.com/).

- Next.js 14+ `/app` router
- TypeScript
- Tailwind CSS
- shadcn/ui (Radix UI + Tailwind)
- Prettier (w/ auto sort imports and tailwind classes)
- SEO optimized
- Typesafe env, icons, and config
- Ready to use - jump right into development

## Scripts

If you are using a different package manager, be sure to update the package.json format scripts.

1. Check project formatting

```bash
pnpm format:check
```

2. Format the project

```bash
pnpm format
```

## Local development quick start (Windows / WSL / Linux)

Follow these steps to run the frontend locally.

1. Install dependencies

```powershell
cd frontend
pnpm install
```

2. Copy environment example and edit

```powershell
copy .env.example .env.local
notepad .env.local
```

3. Set API base URL (example)

In `.env.local` set:

```
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

4. Start the dev server

```powershell
pnpm dev
```

5. Build and preview locally

```powershell
pnpm build
pnpm preview
```

6. Run lint and tests

```powershell
pnpm lint
pnpm test
```

If you'd like, I can wire up the frontend CI to Vercel and create the initial app shell (work item 272) or implement the frontend auth (work item 273). Which should I do next?
