import Container from "typedi";
import RedisCacheLoaderService from "../services/redisCacheLoader";

export default (): void => {
  const redisCacheLoader = Container.get(RedisCacheLoaderService);
  redisCacheLoader.loadCache();
};
