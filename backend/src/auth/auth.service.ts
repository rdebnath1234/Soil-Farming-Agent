import {
  ConflictException,
  Injectable,
  OnModuleInit,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import * as bcrypt from 'bcrypt';
import { ActivityLogsService } from '../activity-logs/activity-logs.service';

@Injectable()
export class AuthService implements OnModuleInit {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly activityLogsService: ActivityLogsService,
  ) {}

  async onModuleInit() {
    await this.usersService.ensureDefaultAdmin();
  }

  async register(registerDto: RegisterDto) {
    const existing = await this.usersService.findByEmail(registerDto.email);
    if (existing) {
      throw new ConflictException('Email already exists');
    }

    const user = await this.usersService.create(registerDto);
    const token = await this.signToken(String(user._id), user.email, user.role);

    await this.activityLogsService.create({
      action: 'REGISTER',
      actorEmail: user.email,
      actorRole: user.role,
      message: `New user registered: ${user.email}`,
    });

    return { token, user };
  }

  async login(loginDto: LoginDto) {
    const user = await this.usersService.findByEmail(loginDto.email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isValid = await bcrypt.compare(loginDto.password, user.password);
    if (!isValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const token = await this.signToken(String(user._id), user.email, user.role);

    await this.activityLogsService.create({
      action: 'LOGIN',
      actorEmail: user.email,
      actorRole: user.role,
      message: `User logged in: ${user.email}`,
    });

    return { token, user: this.usersService.sanitize(user) };
  }

  private signToken(userId: string, email: string, role: string) {
    return this.jwtService.signAsync({
      sub: userId,
      email,
      role,
    });
  }
}
