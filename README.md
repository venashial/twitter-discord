# Twitter Post ➜ Discord Webhook

This Cloudflare Worker periodically checks the Twitter feed of a specified user for new posts and posts them to Discord with a webhook URL.

## Usage

Connect a webhook with a POST request to `/webhook`, like this:

```http request
POST https://twitter-discord.venashial.workers.dev/webhook

{
  "url": "https://discordapp.com/api/webhooks/123456789/example123456789",
  "twitter": "example_username",
}
```

## Developing

Install pnpm and Node v16. Then install the project dependencies:

```bash
pnpm install
```

Run the following command to start the worker:

```bash
pnpm dev
```