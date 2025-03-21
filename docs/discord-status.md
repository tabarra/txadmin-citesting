# Custom Discord Status Embed

![example discord embed](https://forum-cfx-re.akamaized.net/original/5X/b/c/e/b/bceb61b4b506f0bfcc7429695e3e4c1699845605.png)

Starting in v5.1, **txAdmin** now has a Discord Persistent Status Embed feature.  
This is a Discord embed that txAdmin will update every minute, and you can configure it to display server status, and any other random thing that you can normally do with a Discord embed.  
To add the embed, type `/status add` on a channel that the txAdmin bot has Send Message permission.  
  
To modify the embed, navigate to `txAdmin > Settings > Discord Bot`, and click on the two JSON editor buttons. 
> **Important:** If you are having issues with the JSON encoding, we recommend you use [jsoneditoronline.org](https://jsoneditoronline.org/) to modify your JSON.

## Placeholders
To add dynamic data to the embed, you can use the built-in placeholders, which txAdmin will replace at runtime.  

- `{{serverCfxId}}`: The Cfx.re id of your server, this is tied to your `sv_licenseKey` and detected at runtime.
- `{{serverJoinUrl}}`: The direct join URL of your server. Example: `https://cfx.re/join/xxxxxx`.
- `{{serverBrowserUrl}}`: The FiveM Server browser URL of your server. Example: `https://servers.fivem.net/servers/detail/xxxxxx`.
- `{{serverClients}}`: The number of players online in your server.
- `{{serverMaxClients}}`: The `sv_maxclients` of your server, detected at runtime.
- `{{serverName}}`: This is the txAdmin-given name for this server. Can be changed in `txAdmin > Settings > Global`.
- `{{statusColor}}`: A hex-encoded color, from the Config JSON.
- `{{statusString}}`: A text to be displayed with the server status, from the Config JSON.
- `{{uptime}}`: For how long is the server online. Example: `1 hr, 50 mins`.
- `{{nextScheduledRestart}}`: String with when is the next scheduled restart. Example: `in 2 hrs, 48 mins`.


## Embed JSON:
This is the JSON of the Embed that will be sent to Discord.  
This MUST be a valid Discord embed JSON, and we recommend you use a tool like [discohook.org](https://discohook.org/) to edit the embed. To do so, at the bottom click `JSON Data Editor` and paste the JSON inside the `embeds: [...]` array.  
On the JSON, you don't need to set `color` or `footer` as txAdmin will replace those. You can modify the color in the config json, but the footer is generated by txAdmin.

> **Important:** At save time, txAdmin cannot validate if the embed is correct or not without sending it to the Discord API, so if it does not work check the `System Logs` page in txAdmin and see if there are any errors related to it.

```json
{
    "title": "{{serverName}}",
    "url": "{{serverBrowserUrl}}",
    "description": "You can configure this embed in `txAdmin > Settings > Discord Bot`, and edit everything from it (except footer).",
    "fields": [
        {
            "name": "> STATUS",
            "value": "```\n{{statusString}}\n```",
            "inline": true
        },
        {
            "name": "> PLAYERS",
            "value": "```\n{{serverClients}}/{{serverMaxClients}}\n```",
            "inline": true
        },
        {
            "name": "> F8 CONNECT COMMAND",
            "value": "```\nconnect 123.123.123.123\n```"
        },
        {
            "name": "> NEXT RESTART",
            "value": "```\n{{nextScheduledRestart}}\n```",
            "inline": true
        },
        {
            "name": "> UPTIME",
            "value": "```\n{{uptime}}\n```",
            "inline": true
        }
    ],
    "image": {
        "url": "https://forum-cfx-re.akamaized.net/original/5X/e/e/c/b/eecb4664ee03d39e34fcd82a075a18c24add91ed.png"
    },
    "thumbnail": {
        "url": "https://forum-cfx-re.akamaized.net/original/5X/9/b/d/7/9bd744dc2b21804e18c3bb331e8902c930624e44.png"
    }
}
```

## Embed Config JSON:
The configuration of the embed, where you can change the status texts, as well as the embed color. 
You can set up to 5 buttons.  
For emojis, you can use an actual unicode emoji character, or the emoji ID.  
To get the emoji ID, insert it into discord, and add `\` before it then send the message to get the full name (eg `<:txicon:1062339910654246964>`).

```json
{
    "onlineString": "🟢 Online",
    "onlineColor": "#0BA70B",
    "partialString": "🟡 Partial",
    "partialColor": "#FFF100",
    "offlineString": "🔴 Offline",
    "offlineColor": "#A70B28",
    "buttons": [
        {
            "emoji": "1062338355909640233",
            "label": "Connect",
            "url": "{{serverJoinUrl}}"
        },
        {
            "emoji": "1062339910654246964",
            "label": "txAdmin Discord",
            "url": "https://discord.gg/txAdmin"
        }
    ]
}
```
