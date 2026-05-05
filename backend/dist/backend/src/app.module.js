"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const core_1 = require("@nestjs/core");
const nestjs_zod_1 = require("nestjs-zod");
const prisma_module_1 = require("./common/prisma/prisma.module");
const auth_module_1 = require("./modules/auth/auth.module");
const company_module_1 = require("./modules/company/company.module");
const projects_module_1 = require("./modules/projects/projects.module");
const expenses_module_1 = require("./modules/expenses/expenses.module");
const analysis_module_1 = require("./modules/analysis/analysis.module");
const claims_module_1 = require("./modules/claims/claims.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({ isGlobal: true }),
            prisma_module_1.PrismaModule,
            auth_module_1.AuthModule,
            company_module_1.CompanyModule,
            projects_module_1.ProjectsModule,
            expenses_module_1.ExpensesModule,
            analysis_module_1.AnalysisModule,
            claims_module_1.ClaimsModule,
        ],
        providers: [
            {
                provide: core_1.APP_PIPE,
                useClass: nestjs_zod_1.ZodValidationPipe,
            },
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map