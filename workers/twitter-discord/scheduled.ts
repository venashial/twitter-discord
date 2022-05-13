import type {CronEvent} from 'worktop/cfw'
import {list, write, remove} from 'worktop/cfw.kv'
import type {Bindings, Webhook} from './types'

export async function scheduled(event: CronEvent, bindings: Bindings['bindings']): Promise<void> {
    try {
        console.log('Starting scan...')
        const start_time = new Date(event.scheduledTime - (1000 * 60 * 5)).toISOString()
        const end_time = new Date(event.scheduledTime).toISOString()
        console.log(`Using timeframe ${start_time} <-> ${end_time}`)

        for await (const chunk of await list(bindings.DATA, {prefix: 'webhooks::', metadata: true})) {
            await Promise.allSettled(chunk.keys.map(async (key) => {
                // Check twitter
                const webhook = key.metadata as Webhook
                const webhookUrl = key.name.replace('webhooks::', '')

                const params = new URLSearchParams({
                    max_results: '20',
                    exclude: 'replies,retweets',
                    start_time,
                    end_time,
                })

                const response = await fetch(`https://api.twitter.com/2/users/${webhook.twitterID}/tweets/?${params.toString()}`, {
                    headers: {
                        Authorization: `Bearer ${bindings.TWITTER_BEARER_TOKEN}`,
                    }
                })

                if (response.ok) {
                    const {data} = await response.json()

                    if (data) {
                        console.log(`Found ${data.length} tweets for @${webhook.twitterUsername}`)

                        await Promise.allSettled(data.map(async (tweet: { text: string, id: string }) => {
                            console.log(`Found new tweet: ${tweet.text}`)
                            const discordResponse = await fetch(webhookUrl, {
                                method: 'POST',
                                body: JSON.stringify({
                                    wait: true, // Wait for error
                                    username: 'Twitter',
                                    avatar_url: 'https://i.imgur.com/qd3WoCM.png',
                                    content: `https://twitter.com/${webhook.twitterUsername}/status/${tweet.id}`,
                                }),
                                headers: {
                                    'Content-Type': 'application/json',
                                },
                            })

                            if (!discordResponse.ok) {
                                console.log(`Failed to send tweet to Discord. Status: ${discordResponse.status}. Body: ${await discordResponse.text()}`)

                                // If failed for the past ~3 hours
                                if (webhook.failedAttempts > 40) {
                                    await remove(bindings.DATA, `webhooks::${webhookUrl}`)
                                } else {
                                    webhook.failedAttempts++
                                    await write(bindings.DATA, `webhooks::${webhookUrl}`, webhook)
                                }
                            } else if (webhook.failedAttempts > 0) {
                                // Success, reset failed attempts
                                webhook.failedAttempts = 0
                                await write(bindings.DATA, `webhooks::${webhookUrl}`, webhook)
                            }
                        }))
                    }
                } else {
                    console.error(`Failed to fetch tweets for @${webhook.twitterUsername}`)
                    console.error(await response.json())
                }
            }))
        }
        console.log('Scan complete.')
    } catch (e) {
        console.error(e)
    }
}