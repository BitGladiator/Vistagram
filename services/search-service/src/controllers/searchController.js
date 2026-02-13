const { client, INDEXES } = require('../config/opensearch');
const redis = require('../config/redis');

const MAX_RESULTS = parseInt(process.env.MAX_SEARCH_RESULTS) || 20;
const MIN_QUERY_LENGTH = parseInt(process.env.MIN_QUERY_LENGTH) || 2;
const CACHE_TTL = parseInt(process.env.REDIS_SEARCH_TTL) || 300;

// Search everything
const searchAll = async (req, res, next) => {
  try {
    const { q } = req.query;
    const limit = parseInt(req.query.limit) || 10;

    if (!q || q.trim().length < MIN_QUERY_LENGTH) {
      return res.status(400).json({
        status: 'error',
        error: {
          code: 'VALIDATION_ERROR',
          message: `Query must be at least ${MIN_QUERY_LENGTH} characters`
        }
      });
    }

    const searchTerm = q.trim().toLowerCase();

    // Check cache
    const cacheKey = `search:all:${searchTerm}`;
    const cached = await redis.get(cacheKey);
    if (cached) {
      return res.status(200).json({
        status: 'success',
        data: { ...cached, source: 'cache' },
        meta: { timestamp: new Date().toISOString() }
      });
    }

    // Search users and hashtags in parallel
    const [usersResponse, hashtagsResponse] = await Promise.all([
      client.search({
        index: INDEXES.USERS,
        body: {
          size: limit,
          query: {
            multi_match: {
              query: searchTerm,
              fields: ['username^3', 'full_name^2', 'bio'],
              fuzziness: 'AUTO'
            }
          },
          sort: [
            { is_verified: 'desc' },
            { follower_count: 'desc' }
          ]
        }
      }),
      client.search({
        index: INDEXES.HASHTAGS,
        body: {
          size: limit,
          query: {
            match: {
              tag: { query: searchTerm, fuzziness: 'AUTO' }
            }
          },
          sort: [{ post_count: 'desc' }]
        }
      })
    ]);

    const responseData = {
      users: usersResponse.body.hits.hits.map(hit => hit._source),
      hashtags: hashtagsResponse.body.hits.hits.map(hit => hit._source),
      query: searchTerm
    };

    await redis.set(cacheKey, responseData, CACHE_TTL);

    res.status(200).json({
      status: 'success',
      data: { ...responseData, source: 'opensearch' },
      meta: { timestamp: new Date().toISOString() }
    });
  } catch (error) {
    next(error);
  }
};

// Search users
const searchUsers = async (req, res, next) => {
  try {
    const { q } = req.query;
    const limit = parseInt(req.query.limit) || MAX_RESULTS;
    const from = parseInt(req.query.offset) || 0;

    if (!q || q.trim().length < MIN_QUERY_LENGTH) {
      return res.status(400).json({
        status: 'error',
        error: {
          code: 'VALIDATION_ERROR',
          message: `Query must be at least ${MIN_QUERY_LENGTH} characters`
        }
      });
    }

    const searchTerm = q.trim().toLowerCase();

    // Check cache
    const cacheKey = `search:users:${searchTerm}:${limit}:${from}`;
    const cached = await redis.get(cacheKey);
    if (cached) {
      return res.status(200).json({
        status: 'success',
        data: { ...cached, source: 'cache' },
        meta: { timestamp: new Date().toISOString() }
      });
    }

    const response = await client.search({
      index: INDEXES.USERS,
      body: {
        from,
        size: limit,
        query: {
          bool: {
            should: [
              // Exact username match gets highest boost
              {
                term: {
                  'username.keyword': {
                    value: searchTerm,
                    boost: 10
                  }
                }
              },
              // Prefix match on username
              {
                prefix: {
                  'username.keyword': {
                    value: searchTerm,
                    boost: 5
                  }
                }
              },
              // Full text match on username and full_name
              {
                multi_match: {
                  query: searchTerm,
                  fields: ['username^3', 'full_name^2', 'bio'],
                  fuzziness: 'AUTO'
                }
              }
            ]
          }
        },
        sort: [
          '_score',
          { is_verified: 'desc' },
          { follower_count: 'desc' }
        ]
      }
    });

    const total = response.body.hits.total.value;
    const users = response.body.hits.hits.map(hit => ({
      ...hit._source,
      score: hit._score
    }));

    const responseData = {
      users,
      pagination: {
        total,
        limit,
        offset: from,
        has_more: from + limit < total
      },
      query: searchTerm
    };

    await redis.set(cacheKey, responseData, CACHE_TTL);

    res.status(200).json({
      status: 'success',
      data: { ...responseData, source: 'opensearch' },
      meta: { timestamp: new Date().toISOString() }
    });
  } catch (error) {
    next(error);
  }
};

// Search hashtags
const searchHashtags = async (req, res, next) => {
  try {
    const { q } = req.query;
    const limit = parseInt(req.query.limit) || MAX_RESULTS;
    const from = parseInt(req.query.offset) || 0;

    if (!q || q.trim().length < MIN_QUERY_LENGTH) {
      return res.status(400).json({
        status: 'error',
        error: {
          code: 'VALIDATION_ERROR',
          message: `Query must be at least ${MIN_QUERY_LENGTH} characters`
        }
      });
    }

    const searchTerm = q.trim().toLowerCase().replace('#', '');

    // Check cache
    const cacheKey = `search:hashtags:${searchTerm}:${limit}:${from}`;
    const cached = await redis.get(cacheKey);
    if (cached) {
      return res.status(200).json({
        status: 'success',
        data: { ...cached, source: 'cache' },
        meta: { timestamp: new Date().toISOString() }
      });
    }

    const response = await client.search({
      index: INDEXES.HASHTAGS,
      body: {
        from,
        size: limit,
        query: {
          bool: {
            should: [
              // Exact match
              {
                term: {
                  'tag.keyword': {
                    value: searchTerm,
                    boost: 5
                  }
                }
              },
              // Prefix match
              {
                prefix: {
                  'tag.keyword': {
                    value: searchTerm,
                    boost: 3
                  }
                }
              },
              // Fuzzy match
              {
                match: {
                  tag: {
                    query: searchTerm,
                    fuzziness: 'AUTO'
                  }
                }
              }
            ]
          }
        },
        sort: [
          '_score',
          { post_count: 'desc' }
        ]
      }
    });

    const total = response.body.hits.total.value;
    const hashtags = response.body.hits.hits.map(hit => hit._source);

    const responseData = {
      hashtags,
      pagination: {
        total,
        limit,
        offset: from,
        has_more: from + limit < total
      },
      query: searchTerm
    };

    await redis.set(cacheKey, responseData, CACHE_TTL);

    res.status(200).json({
      status: 'success',
      data: { ...responseData, source: 'opensearch' },
      meta: { timestamp: new Date().toISOString() }
    });
  } catch (error) {
    next(error);
  }
};

// Search posts
const searchPosts = async (req, res, next) => {
  try {
    const { q } = req.query;
    const limit = parseInt(req.query.limit) || MAX_RESULTS;
    const from = parseInt(req.query.offset) || 0;

    if (!q || q.trim().length < MIN_QUERY_LENGTH) {
      return res.status(400).json({
        status: 'error',
        error: {
          code: 'VALIDATION_ERROR',
          message: `Query must be at least ${MIN_QUERY_LENGTH} characters`
        }
      });
    }

    const searchTerm = q.trim().toLowerCase().replace('#', '');

    // Check cache
    const cacheKey = `search:posts:${searchTerm}:${limit}:${from}`;
    const cached = await redis.get(cacheKey);
    if (cached) {
      return res.status(200).json({
        status: 'success',
        data: { ...cached, source: 'cache' },
        meta: { timestamp: new Date().toISOString() }
      });
    }

    const response = await client.search({
      index: INDEXES.POSTS,
      body: {
        from,
        size: limit,
        query: {
          bool: {
            must: [
              { term: { is_deleted: false } }
            ],
            should: [
              // Search in caption
              {
                match: {
                  caption: {
                    query: searchTerm,
                    boost: 2,
                    fuzziness: 'AUTO'
                  }
                }
              },
              // Search in hashtags
              {
                term: {
                  hashtags: {
                    value: searchTerm,
                    boost: 3
                  }
                }
              },
              // Search in location
              {
                match: {
                  location: searchTerm
                }
              }
            ],
            minimum_should_match: 1
          }
        },
        sort: [
          '_score',
          { like_count: 'desc' },
          { created_at: 'desc' }
        ]
      }
    });

    const total = response.body.hits.total.value;
    const posts = response.body.hits.hits.map(hit => ({
      ...hit._source,
      score: hit._score
    }));

    const responseData = {
      posts,
      pagination: {
        total,
        limit,
        offset: from,
        has_more: from + limit < total
      },
      query: searchTerm
    };

    await redis.set(cacheKey, responseData, CACHE_TTL);

    res.status(200).json({
      status: 'success',
      data: { ...responseData, source: 'opensearch' },
      meta: { timestamp: new Date().toISOString() }
    });
  } catch (error) {
    next(error);
  }
};

// Autocomplete suggestions
const autocomplete = async (req, res, next) => {
  try {
    const { q } = req.query;

    if (!q || q.trim().length < 1) {
      return res.status(200).json({
        status: 'success',
        data: { suggestions: [] },
        meta: { timestamp: new Date().toISOString() }
      });
    }

    const searchTerm = q.trim().toLowerCase().replace('#', '');

    // Check cache (short TTL for autocomplete)
    const cacheKey = `search:autocomplete:${searchTerm}`;
    const cached = await redis.get(cacheKey);
    if (cached) {
      return res.status(200).json({
        status: 'success',
        data: { suggestions: cached, source: 'cache' },
        meta: { timestamp: new Date().toISOString() }
      });
    }

    // Use search_as_you_type for autocomplete
    const [usersResponse, hashtagsResponse] = await Promise.all([
      client.search({
        index: INDEXES.USERS,
        body: {
          size: 5,
          query: {
            multi_match: {
              query: searchTerm,
              type: 'bool_prefix',
              fields: [
                'username.autocomplete',
                'username.autocomplete._2gram',
                'username.autocomplete._3gram'
              ]
            }
          },
          sort: [
            { is_verified: 'desc' },
            { follower_count: 'desc' }
          ]
        }
      }),
      client.search({
        index: INDEXES.HASHTAGS,
        body: {
          size: 5,
          query: {
            multi_match: {
              query: searchTerm,
              type: 'bool_prefix',
              fields: [
                'tag.autocomplete',
                'tag.autocomplete._2gram',
                'tag.autocomplete._3gram'
              ]
            }
          },
          sort: [{ post_count: 'desc' }]
        }
      })
    ]);

    const suggestions = [
      ...usersResponse.body.hits.hits.map(hit => ({
        type: 'user',
        id: hit._source.user_id,
        text: hit._source.username,
        subtitle: hit._source.full_name,
        image: hit._source.profile_picture_url,
        is_verified: hit._source.is_verified,
        meta: { followers: hit._source.follower_count }
      })),
      ...hashtagsResponse.body.hits.hits.map(hit => ({
        type: 'hashtag',
        text: `#${hit._source.tag}`,
        meta: { post_count: hit._source.post_count }
      }))
    ];

    // Cache for short time
    await redis.set(cacheKey, suggestions, 60);

    res.status(200).json({
      status: 'success',
      data: { suggestions, source: 'opensearch' },
      meta: { timestamp: new Date().toISOString() }
    });
  } catch (error) {
    next(error);
  }
};

// Get trending hashtags
const getTrending = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 10;

    // Check cache
    const cacheKey = `search:trending:${limit}`;
    const cached = await redis.get(cacheKey);
    if (cached) {
      return res.status(200).json({
        status: 'success',
        data: { trending: cached, source: 'cache' },
        meta: { timestamp: new Date().toISOString() }
      });
    }

    // Get most popular hashtags by post_count
    const response = await client.search({
      index: INDEXES.HASHTAGS,
      body: {
        size: limit,
        query: { match_all: {} },
        sort: [{ post_count: 'desc' }]
      }
    });

    const trending = response.body.hits.hits.map(hit => hit._source);

    // Cache trending (longer TTL)
    await redis.set(cacheKey, trending, CACHE_TTL * 2);

    res.status(200).json({
      status: 'success',
      data: { trending, source: 'opensearch' },
      meta: { timestamp: new Date().toISOString() }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  searchAll,
  searchUsers,
  searchHashtags,
  searchPosts,
  autocomplete,
  getTrending
};