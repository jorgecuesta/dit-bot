### Destiny 2 Item Tracker Bot

Little bot for [Discord](https://) that used [Bungie](https://bungie.net) API to ask search terms.

#### Deploy:

1. `npm i` or `yarn`
2. Create your own `.env` file following `.env.sample` file.
  * NODE_ENV= Environment (development|production) Default: development
  * TRIGGER= Command trigger like ! Default: !
  * BUNGIE_API_KEY= Bungie X-API-Key
  * DISCORD_BOT_TOKEN= Discord Bot Token
  * LOCALE= Language that bot will use to search and publish messages (Spanish|SpanishMexican|English)

#### Commands:

* [trigger]buscar [option] [search terms]
* [trigger]ayuda


#### TODOS:
* I18N commands and options.

#### Bot URI

* https://discordapp.com/api/oauth2/authorize?client_id=<client-id>&scope=bot&permissions=0x00000800
