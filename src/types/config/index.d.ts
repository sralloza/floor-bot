export default interface Settings {
  port: number;
  jwtSecret: string;
  jwtAlgorithm: string;
  logs: {
    level: string;
  };
  api: {
    prefix: string;
  };
  google_client_id: string;
  orm: {
    type: string;
    host: string;
    port: number;
    username: string;
    password: string;
    database: string;
    synchronize: boolean;
    logging: boolean;
    entities: string;
    migrations: string;
    subscribers: string;
    cli: {
      entitiesDir: string;
      migrationsDir: string;
      subscribersDir: string;
    };
  };
}
