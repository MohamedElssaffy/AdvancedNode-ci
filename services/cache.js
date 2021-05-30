const util = require("util");
const mongoose = require("mongoose");
const redis = require("redis");
const keys = require("../config/keys");

const client = redis.createClient(keys.redisUrl);

client.hget = util.promisify(client.hget);

const exec = mongoose.Query.prototype.exec;

mongoose.Query.prototype.cache = function (key = "") {
  this.useCache = true;

  this.hKey = JSON.stringify(key);

  return this;
};

mongoose.Query.prototype.exec = async function () {
  if (!this.useCache) {
    return exec.apply(this, arguments);
  }

  const key = JSON.stringify(
    Object.assign({}, this.getQuery(), {
      collection: this.mongooseCollection.name,
    })
  );
  const cacheVal = await client.hget(this.hKey, key);

  if (cacheVal) {
    const result = JSON.parse(cacheVal);

    return Array.isArray(result)
      ? result.map((el) => new this.model(el))
      : new this.model(result);
  }

  const result = await exec.apply(this, arguments);

  client.hset(this.hKey, key, JSON.stringify(result));
  client.expire(this.hKey, 60 * 15);

  return result;
};

module.exports = {
  clearCache(key) {
    client.del(JSON.stringify(key));
  },
};
