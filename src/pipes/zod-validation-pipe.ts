import { BadRequestException } from '@nestjs/common'
import { ZodError } from 'zod'

export class ZodValidationPipe {
  constructor(private schema) {}

  transform(value: unknown) {
    try {
      return this.schema.parse(value)
    } catch (error) {
      if (error instanceof ZodError) {
        throw new BadRequestException({
          message: 'Validation failed',
          statusCode: 400,
          errors: error.format(),
        })
      }

      throw new BadRequestException('Validation failed')
    }
  }
}
