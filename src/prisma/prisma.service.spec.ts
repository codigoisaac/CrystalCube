/* Made mostly by AI */

import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from './prisma.service';

describe('PrismaService', () => {
  let service: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PrismaService],
    }).compile();

    service = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should connect on module init', async () => {
    // Mock the $connect method to avoid actual database connection
    const connectSpy = jest
      .spyOn(service, '$connect')
      .mockResolvedValue(undefined);

    // Call onModuleInit - this covers line 7
    await service.onModuleInit();

    // Verify $connect was called
    expect(connectSpy).toHaveBeenCalledTimes(1);

    // Clean up
    connectSpy.mockRestore();
  });
});
