import { HttpStatus } from '@nestjs/common';

export const sendSuccessResponse = (res, data, message: string) => {
  if (!data) {
    return res
      .status(HttpStatus.BAD_REQUEST)
      .json({ success: false, message, data: null });
  }
  return res.status(HttpStatus.OK).json({ success: true, message, data });
};

export const sendErrorResponse = (res, error: string | object) => {
  if (typeof error === 'string') {
    return res.status(HttpStatus.BAD_REQUEST).json({
      success: false,
      message: error,
      data: null,
    });
  }
  console.log(error);
  return res.status(HttpStatus.BAD_REQUEST).json({
    success: false,
    message: 'Something went wrong',
    data: null,
  });
};
