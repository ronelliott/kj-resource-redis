'use strict';

var extend = require('extend'),
    is = require('is'),
    prequire = require('parent-require'),
    redis = prequire('redis'),
    redisUrl = require('redis-url');

module.exports = function($opts) {
    var enabled = is.defined($opts.enabled) ? $opts.enabled : true,
        inject = $opts.inject || '$redis',
        uri = $opts.uri;

    if (enabled && (is.null(uri) || is.undefined(uri))) {
        throw new Error('URI is not defined!');
    }

    return function($$resolver, callback) {
        if (!enabled) {
            callback();
            return;
        }

        var cfg = redisUrl.parse(uri),
            opts = extend(true, { auth_pass: cfg.password }, cfg.query),
            client = redis.createClient(cfg.port, cfg.hostname, opts);

        client.select(cfg.database, function(err) {
            if (err) {
                callback(err);
                return;
            }

            $$resolver.add(inject, client);
            callback();
        });
    };
};
