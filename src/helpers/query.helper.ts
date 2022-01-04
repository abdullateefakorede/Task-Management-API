export const requestFilter = (requestBody) => {
  const expectedProperties = ['name', 'dueAt', 'completed'];
  const filter = {};
  for (const key in requestBody) {
    if (expectedProperties.includes(key) && requestBody[key] !== undefined) {
      filter[key] = requestBody[key];
    }
  }
  return filter;
};
