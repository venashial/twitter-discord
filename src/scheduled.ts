import type { CronEvent } from 'worktop/cfw'
import { list, write, remove } from 'worktop/cfw.kv'
import type { Bindings, Webhook } from './types'
import { XMLParser } from 'fast-xml-parser'

export async function scheduled(event:  CronEvent, bindings: Bindings['bindings']): Promise<void> {
    try {
        console.log('Starting scan...')
        const parser = new XMLParser()
        const time = new Date(event.scheduledTime - (1000 * 60 * 5))

        for await (const chunk of await list(bindings.DATA, {prefix: 'webhooks::', metadata: true})) {
            await Promise.allSettled(chunk.keys.map(async (key) => {
                // Check twitter
                const webhook = key.metadata as Webhook
                const webhookUrl = key.name.replace('webhooks::', '')
                const response = await fetch(`https://nitter.net/${webhook.twitter}/rss`)
                const xml = parser.parse(await response.text())

                await Promise.allSettled(xml.rss.channel.item.map(async (item: Record<string, string>) => {
                    const published = new Date(item.pubDate)
                    // Check if tweet was published within time of last scan,
                    // and it isn't a retweet
                    if (published.getTime() > time.getTime() && item['dc:creator'].toLowerCase() === '@' + webhook.twitter.toLowerCase()) {
                        console.log(`Found new tweet: ${item.title}`)
                        const discordResponse = await fetch(webhookUrl, {
                            method: 'POST',
                            body: JSON.stringify({
                                wait: true, // Wait for error
                                username: 'Twitter',
                                avatar_url: 'https://i.imgur.com/qd3WoCM.png',
                                content: item.link.replace('nitter.net', 'twitter.com'),
                            }),
                            headers: {
                                'Content-Type': 'application/json',
                            },
                        })

                        if (!discordResponse.ok) {
                            console.log(`Failed to send tweet to Discord. Status: ${discordResponse.status}. Body: ${await discordResponse.text()}`)

                            // If failed for the past ~3 hours
                            if (webhook.failedAttempts > 40) {
                                await remove(bindings.DATA, `webhooks::${webhook.twitter}`)
                            } else {
                                webhook.failedAttempts++
                                await write(bindings.DATA, `webhooks::${webhookUrl}`, webhook)
                            }
                        } else if (webhook.failedAttempts > 0) {
                            // Success, reset failed attempts
                            webhook.failedAttempts = 0
                            await write(bindings.DATA, `webhooks::${webhookUrl}`, webhook)
                        }
                    }
                }))
            }))
        }
        console.log('Scan complete.')
    } catch (e) {
        console.log(e)
    }
}