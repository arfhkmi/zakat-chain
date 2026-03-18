import { Test, TestingModule } from '@nestjs/testing';
import { ZakatController } from './zakat.controller';
import { ZakatService } from './zakat.service';

describe('ZakatController', () => {
  let controller: ZakatController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ZakatController],
      providers: [ZakatService],
    }).compile();

    controller = module.get<ZakatController>(ZakatController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
