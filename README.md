# botrac3r
### Yet another Discord bot
A Discord bot for utilities, fun, time zones, deleting spoo.py's lmaos, playing One Night Ultimate Werewolf, sending random hippos, and many more unrelated things.

## Running
### Install libraries
    npm install discord.io portscanner canvas exif sync-request youtube-dl
If you aren't able to install canvas, see https://github.com/Automattic/node-canvas for help.

Make sure ffmpeg is in your PATH. If you don't know what this means, search it, or read discord.io's documentation.
### Add tokens
Required bot token:

Create an empty file named `token.txt` and put your bot token in it. If you don't have a bot token, you should obtain one by creating an app at https://discordapp.com/developers/applications/me.

Other optional tokens:

You'll need a YouTube API token in order to add playlists and search. If you have one, put it on the second line of `token.txt`.

If you want to post to forums, you'll need some cookies. Obtain a cookies string (e.g. fc=%7B%22NjEx; pv=%7BiFf8%3A9...) paste it into `epigam-cookies.txt`.

### Start bot
    node botrac3r.js

## Documentation
botrac3r's commands are documented in the `botrac3r-docs.pdf` and `botrac3r-docs.odt` files. The PDF is smaller but not editable; the ODT is larger and editable.
