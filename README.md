# The Floor Bot

## Deployment

### Docker images

```bash
docker buildx build -t sralloza/floor-bot:$VERSION --platform=linux/arm/v7,linux/amd64 --push .
```

### Environment variables

- `ADMIN_ID`: the admin's user telegram ID
- `AWAIT_TABLE_GENERATION`: if set to `true` the system will await for the tables URLS before returning the message to the user.
- `DISABLE_REDIS`: if set to `true` redis cache will be disabled.
- `ENABLE_CRON_INTEGRATION`: if set to `true` cron system will be deactivated.
- `GOOGLE_PRIVATE_KEY`: the private key to work with google spreadsheets.
- `GOOGLE_SERVICE_ACCOUNT_EMAIL`: the service account email to work with google spreadsheets.
- `LOG_LEVEL`: winston's log level. Defaults to `silly`.
- `PORT`: the port where the API will be listening. Defaults to `80`.
- `REDIS_HOST`: host where redis is listening. Defaults to `localhost`.
- `REDIS_PORT`: port where redis is listening. Defaults to  `6379`.
- `TELEGRAM_TOKEN_BOT`: the telegram bot's token.
- `DISABLE_SCHEDULER_START_DATE`: if set, all the tasks cronjobs will be disabled from this date.
- `DISABLE_SCHEDULER_END_DATE`: if set, all tasks cronjobs will be reenabled from this date.
