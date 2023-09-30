import * as common from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { AuthGuard } from '@nestjs/passport'
import { ZodValidationPipe } from 'src/pipes/zod-validation-pipe'
import { PrismaService } from 'src/prisma/prisma.service'
import { z } from 'zod'

const pageQueryParamScheema = z
  .string()
  .optional()
  .default('1')
  .transform(Number)
  .pipe(z.number().min(1))

type PageQueryParam = z.infer<typeof pageQueryParamScheema>

const queryValidationPipe = new ZodValidationPipe(pageQueryParamScheema)

@common.Controller('/questions')
@common.UseGuards(AuthGuard('jwt'))
export class FetchRecentQuestionsController {
  constructor(
    private jwt: JwtService,
    private prisma: PrismaService,
  ) {}

  @common.Get()
  async handle(
    @common.Query('page', queryValidationPipe) page: PageQueryParam,
  ) {
    const questions = await this.prisma.question.findMany({
      take: 1,
      skip: page - 1 * 1,
      orderBy: {
        createdAt: 'desc',
      },
    })
    return { questions }
  }
}
