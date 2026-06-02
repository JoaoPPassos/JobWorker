import { Injectable } from '@nestjs/common';
import { IEnrichmentUseCase } from '@domain/port/IJobEnrichment.port';
import { source_type } from '@shared/enums/source.enum';
import { LinkedinUseCase } from '../use-cases/linkedin-use-case.use-case';

@Injectable()
export class EnrichmentUseCaseFactory {
  private readonly useCases: Map<string, IEnrichmentUseCase>;

  constructor(private linkedinUseCase: LinkedinUseCase) {
    this.useCases = new Map<string, IEnrichmentUseCase>([
      [source_type.linkedin, this.linkedinUseCase],
    ]);
  }

  getUseCase(platform: string): IEnrichmentUseCase | undefined {
    return this.useCases.get(platform);
  }
}
