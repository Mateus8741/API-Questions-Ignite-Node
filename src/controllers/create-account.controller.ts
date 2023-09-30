import * as common from '@nestjs/common'
import { hash } from 'bcryptjs'
import { ZodValidationPipe } from 'src/pipes/zod-validation-pipe'
import { PrismaService } from 'src/prisma/prisma.service'
import { z } from 'zod'

const createAccountBodySchema = z.object({
  name: z.string().min(2).max(20),
  email: z.string().email(),
  password: z.string().min(8).max(20),
})

type CreateAccountBodyScheema = z.infer<typeof createAccountBodySchema>

@common.Controller('/accounts')
export class CreateAccountController {
  constructor(private prisma: PrismaService) {}

  @common.Post()
  @common.HttpCode(201)
  @common.UsePipes(new ZodValidationPipe(createAccountBodySchema))
  async handle(@common.Body() body: CreateAccountBodyScheema) {
    const { name, email, password } = body

    const userWithSameEmail = await this.prisma.user.findUnique({
      where: {
        email,
      },
    })
    if (userWithSameEmail) {
      throw new common.ConflictException('User with same email already exists')
    }

    const hashedPassword = await hash(password, 8)

    await this.prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    })
  }
}
