# Bee Booot

This is a Discord bot using the [sapphire framework][sapphire] written in TypeScript.

## How to use it?

### Prerequisite

```sh
npm install
```

### Development

This example can be run with `tsc-watch` to watch the files and automatically restart your bot.

```sh
npm run watch:start
```

### Production

You can also run the bot with `npm dev`, this will first build your code and then run `node ./dist/index.js`. But this is not the recommended way to run a bot in production.

## Building and Running in PM2

1. **Build Your TypeScript Code:**

   Compile your TypeScript code to JavaScript:

   ```sh
   npx tsc
   ```

2. **Run with PM2:**

   Use PM2 to run the compiled JavaScript file:

   ```sh
   pm2 start dist/index.js --name typescript-bot
   ```

3. **Save and Auto-Restart:**

   Save your PM2 process list and configure it to restart on system reboots:

   ```sh
   pm2 save
   pm2 startup
   ```

## License

Dedicated to the public domain via the [Unlicense], courtesy of the Sapphire Community and its contributors.

[sapphire]: https://github.com/sapphiredev/framework
[unlicense]: https://github.com/sapphiredev/examples/blob/main/LICENSE.md
