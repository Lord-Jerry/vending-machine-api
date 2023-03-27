import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import constants from '../constants';

const { environmentalVariables } = constants;
type keyUnion = (typeof environmentalVariables)[number];

@Injectable()
export class ConfigMangerService implements OnApplicationBootstrap {
  constructor(private config: ConfigService) {}

  get(key: keyUnion): string {
    return this.config.get(key);
  }

  onApplicationBootstrap() {
    for (const key of environmentalVariables) {
      if (!this.config.get(key)) {
        throw new Error(`missing ENV variable ${key}`);
      }
    }
  }
}
