import { createClient, RedisClientType } from "redis";

class Redis {
	private static instance: Redis;

	public client: RedisClientType;

	constructor(redisUri: string) {
		this.client = createClient({
			url: redisUri,
		});
	}

	public async run() {
		try {
			await this.client.connect();
		} catch (error) {
			console.error(error);
		}
	}

	public async stop() {
		try {
			await this.client.disconnect();
		} catch (error) {
			console.error(error);
		}
	}

	public static getInstance(): Redis {
		if (!Redis.instance) {
			Redis.instance = new Redis(process.env.REDIS_URI!);
		}

		return Redis.instance;
	}
}

export const redis = Redis.getInstance();
