import * as common from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { compare } from 'bcryptjs'
import { ZodValidationPipe } from 'src/pipes/zod-validation-pipe'
import { PrismaService } from 'src/prisma/prisma.service'
import { z } from 'zod'

const authenticateBodySchema = z.object({
  name: z.string().min(2).max(20),
  email: z.string().email(),
  password: z.string().min(8).max(20),
})

type AuthenticateBodySchema = z.infer<typeof authenticateBodySchema>

@common.Controller('/sessions')
export class AuthenticateController {
  constructor(
    private jwt: JwtService,
    private prisma: PrismaService,
  ) {}

  @common.Post()
  @common.UsePipes(new ZodValidationPipe(authenticateBodySchema))
  async handle(@common.Body() body: AuthenticateBodySchema) {
    const { email, password } = body

    const user = await this.prisma.user.findUnique({
      where: { email },
    })

    if (!user) {
      throw new common.UnauthorizedException('Invalid credentials')
    }

    const isPasswordValid = await compare(password, user.password)

    if (!isPasswordValid) {
      throw new common.UnauthorizedException('Invalid credentials')
    }

    const accessToken = this.jwt.sign({ sub: user.id })

    return {
      access_token: accessToken,
    }
  }
}
