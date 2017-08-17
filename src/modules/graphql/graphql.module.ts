'use strict';

import { Module } from '@nestjs/common';
import { GraphqlController } from "./graphql.controller";

@Module({
    controllers: [GraphqlController],
    components: [],
    modules: [],
    exports: []
})
export class GraphqlModule { }
