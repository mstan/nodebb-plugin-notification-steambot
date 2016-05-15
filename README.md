# NodeBB notification SteamBot

This plugin hooks into NodeBB's alert system, pasisng object data to an active steam bot managed by the plugin. This steam Bot receives a steamID from the database (key value "int-steam-id" from the nodebb-plugin-integration-steam plugin by APEXOLOG).  

If the ID doesn't exist, the system simply returns. If the ID DOES exist, the system will check what kind of notification it is and pass a steam message to the end user accordingly. This will only work if the user has added the bot, however. The bot will automatically accept any friend request sent.

I am not responsible for the creation of nodebb-plugin-integration-steam. For all questions, refer to [APXEOLOG](https://github.com/APXEOLOG). For questions regarding Steam Bubbles, refer to [mstan](https://github.com/mstan)
