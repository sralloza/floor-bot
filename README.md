# The Floor API

## Deployment

### Docker images

Development:

```bash
docker build -t sralloza/floor-api:stable -f Dockerfile.amd .
docker push -t sralloza/floor-api:stable
```

Production:

```bash
docker buildx build -t sralloza/floor-api:stable-arm --platform=linux/arm/v7 --push .
```

### Environment variables

- `PORT`: the port where the API will be listening. Defaults to `80`.
- `LOG_LEVEL`: winston's log level. Defaults to `silly`.
- `TELEGRAM_TOKEN_BOT`: the telegram bot's token.
- `GOOGLE_SERVICE_ACCOUNT_EMAIL`: the service account email to work with google spreadsheets.
- `GOOGLE_PRIVATE_KEY`: the private key to work with google spreadsheets.
