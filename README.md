# JavaScript Caching

Easy-to-use localStorage, sessionStorage and coookies caching.
Supports all data types, revives dates as Date objects (not an ISO string).

## How to

```
  // initialize local, session or cookies cache
  let cache = new LocalCache('[cache prefix]'); // initialize cache (optionally with prefix)
  cache.add('<key>', <value>, [expiration in minutes]); // cache data (optionally with expiration)
  cache.get('<key>'); // retrieve data from cache
  cache.remove('<key>'); // remove from cache
```

## Examples

```
  // init local cache
  let usersCache = new LocalCache('users');
  usersCache.add('user1', { id: 1 });

  let dataCache = new LocalCache('data');
  dataCache.add('data', 42);

  console.log(dataCache.get('data')); // 42
  console.log(usersCache.get('user1')); // { id: 1 }
```
