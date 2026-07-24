// Minimal cookie parser middleware (avoids extra dependency)
export default function cookieMiddleware(req, res, next) {
  const header = req.headers?.cookie;
  if (!header) {
    req.cookies = {};
    return next();
  }

  const obj = Object.fromEntries(
    header.split(';').map((c) => {
      const idx = c.indexOf('=');
      if (idx === -1) return [c.trim(), ''];
      const k = c.slice(0, idx).trim();
      const v = c.slice(idx + 1).trim();
      try {
        return [k, decodeURIComponent(v)];
      } catch (e) {
        return [k, v];
      }
    }),
  );

  req.cookies = obj;
  return next();
}
