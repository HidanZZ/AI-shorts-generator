import { API_KEYS } from "../constants/keys";
import { redis } from "../dataSources/redis";
import { ApiKeys } from "../types/data";

const getKeys = async () => {
	const keys = redis.client.hGetAll("keys");
	return keys;
};

const getKey = async (key: ApiKeys) => {
	const keyData = redis.client.hGet("keys", key);
	return keyData;
};

const addKey = async (key: ApiKeys, value: string) => {
	const keyData = redis.client.hSet("keys", key, value);
	return keyData;
};

const deleteKey = async (key: ApiKeys) => {
	const keyData = redis.client.hDel("keys", key);
	return keyData;
};

export const keysService = {
	getKeys,
	getKey,
	addKey,
	deleteKey,
};
