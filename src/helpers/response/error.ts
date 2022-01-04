import { HttpException, HttpStatus } from '@nestjs/common';

export class ErrorResponse extends HttpException {
  constructor(error) {
    if (typeof error === 'string') {
      super(
        {
          success: false,
          message: error,
          data: null,
        },
        HttpStatus.UNAUTHORIZED,
      );
    } else {
      console.log(error);
      super(
        {
          success: false,
          message: 'Something went wrong',
          data: null,
        },
        HttpStatus.UNAUTHORIZED,
      );
    }
  }
}
