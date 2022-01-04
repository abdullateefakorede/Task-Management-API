import * as queryHelper from '../../../src/helpers/query.helper';

describe('queryHelper', () => {
  describe('requestFilter', () => {
    beforeEach(() => jest.clearAllMocks());

    it('should return filter', async () => {
      const mockReq = {
        name: 'Kobo354',
        dueAt: undefined,
        completed: true,
      };
      const filter = {
        name: 'Kobo354',
        completed: true,
      };

      const result = queryHelper.requestFilter(mockReq);

      expect(result).toEqual(filter);
    });
  });
});
