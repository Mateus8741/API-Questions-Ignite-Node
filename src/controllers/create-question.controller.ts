import * as common from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { AuthGuard } from '@nestjs/passport'
import { UserPayload } from 'src/auth/jwt.strategy'
import { ZodValidationPipe } from 'src/pipes/zod-validation-pipe'
import { PrismaService } from 'src/prisma/prisma.service'
import { z } from 'zod'
import { CurrentUser } from './../auth/current-user-decorator'

const createQuestionBodyScheema = z.object({
  title: z.string().min(10).max(255),
  content: z.string().min(10).max(255),
})

export type CreateQuestionBodyScheema = z.infer<
  typeof createQuestionBodyScheema
>

const bodyValidationPipe = new ZodValidationPipe(createQuestionBodyScheema)

@common.Controller('/questions')
@common.UseGuards(AuthGuard('jwt'))
export class CreateQuestionController {
  constructor(
    private jwt: JwtService,
    private prisma: PrismaService,
  ) {}

  @common.Post()
  async handle(
    @common.Body(bodyValidationPipe) body: CreateQuestionBodyScheema,
    @CurrentUser() user: UserPayload,
  ) {
    const { title, content } = body
    const userId = user.sub

    const slug = this.convertToSlug(title)

    await this.prisma.question.create({
      data: {
        authorId: userId,
        title,
        content,
        slug,
      },
    })
  }

  private convertToSlug(title: string): string {
    return title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
  }
}
