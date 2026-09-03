export type LoadYamlOptions = {
  bypassCache?: boolean;
};

export function fetchPublicYaml(
  pathFromBase: string,
  options: LoadYamlOptions = {}
): Promise<Response> {
  const bypassCache = options.bypassCache === true;
  let url = `${import.meta.env.BASE_URL}${pathFromBase}`;
  if (bypassCache) {
    url += `?t=${Date.now()}`;
  }

  return fetch(url, bypassCache ? { cache: 'no-store' } : undefined);
}
