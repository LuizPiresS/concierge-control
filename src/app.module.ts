import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { BullModule } from '@nestjs/bull';
import { UsersModule } from './modules/users/users.module';
import { CondominiumsModule } from './modules/condominiums/condominiums.module';
import { NotificationsModule } from './shared/notifications/notifications.module';
import { PrismaModule } from './infrastructure/database/prisma/prisma.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    // Configuração raiz do Bull para conectar ao Redis
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        redis: {
          host: configService.get<string>('REDIS_HOST', 'redis'),
          port: 6379,
        },
      }),
      inject: [ConfigService],
    }),
    PrismaModule, // Assumindo que você tem um PrismaModule global
    UsersModule,
    CondominiumsModule, // <-- REGISTRANDO O NOVO MÓDULO
    NotificationsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
