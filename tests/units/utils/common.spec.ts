import * as common from '../../../src/utils/common';

describe('Common', () => {
  describe('generateRandomId', () => {
    beforeEach(() => jest.clearAllMocks());

    it('should return randomId', async () => {
      const length = 5;
      const mockFloor = jest.spyOn(Math, 'floor');
      const mockRandom = jest.spyOn(Math, 'random');

      common.generateRandomId(length);

      expect(mockFloor).toHaveBeenCalledTimes(5);
      expect(mockRandom).toHaveBeenCalledTimes(5);
    });
  });
});
