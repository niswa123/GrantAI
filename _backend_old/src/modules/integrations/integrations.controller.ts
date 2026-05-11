import {
  Controller,
  Get,
  Post,
  Delete,
  Query,
  Param,
  UseGuards,
  Req,
  Res,
  BadRequestException,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { IntegrationsService } from './integrations.service';
import { GithubService } from './services/github.service';
import { JiraService } from './services/jira.service';
import { ProjectSyncService } from './services/project-sync.service';
import { ConfigService } from '@nestjs/config';

@Controller('integrations')
@UseGuards(JwtAuthGuard)
export class IntegrationsController {
  constructor(
    private readonly integrationsService: IntegrationsService,
    private readonly githubService: GithubService,
    private readonly jiraService: JiraService,
    private readonly projectSyncService: ProjectSyncService,
    private readonly configService: ConfigService,
  ) {}

  // ==================== GitHub Integration ====================

  @Get('github/authorize')
  async authorizeGithub(
    @Query('companyId') companyId: string,
    @Res() res: Response,
  ) {
    if (!companyId) {
      throw new BadRequestException('companyId is required');
    }

    // Use companyId as state for OAuth flow
    const authUrl = this.githubService.getAuthorizationUrl(companyId);
    return res.redirect(authUrl);
  }

  @Get('github/callback')
  async githubCallback(
    @Query('code') code: string,
    @Query('state') companyId: string,
    @Res() res: Response,
  ) {
    if (!code || !companyId) {
      throw new BadRequestException('Missing code or state');
    }

    try {
      // Exchange code for access token
      const tokenData = await this.githubService.exchangeCodeForToken(code);

      // Get user info to store in metadata
      const user = await this.githubService.getUser(tokenData.access_token);

      // Save integration
      await this.integrationsService.create({
        companyId,
        provider: 'github',
        accessToken: tokenData.access_token,
        metadata: {
          username: user.login,
          userId: user.id,
          scope: tokenData.scope,
        },
      });

      // Redirect to frontend success page
      const frontendUrl = this.configService.get<string>('FRONTEND_URL');
      return res.redirect(
        `${frontendUrl}/company?integration=github&status=success`,
      );
    } catch (error) {
      const frontendUrl = this.configService.get<string>('FRONTEND_URL');
      return res.redirect(
        `${frontendUrl}/company?integration=github&status=error&message=${encodeURIComponent(error.message)}`,
      );
    }
  }

  @Get('github/repositories')
  async getGithubRepositories(
    @Query('companyId') companyId: string,
    @Req() req: Request,
  ) {
    const integration = await this.integrationsService.findByCompanyAndProvider(
      companyId,
      'github',
    );

    if (!integration) {
      throw new BadRequestException('GitHub integration not found');
    }

    const repositories = await this.githubService.getRepositories(
      integration.access_token,
    );

    return { repositories };
  }

  @Get('github/repositories/:owner/:repo/issues')
  async getGithubIssues(
    @Query('companyId') companyId: string,
    @Param('owner') owner: string,
    @Param('repo') repo: string,
  ) {
    const integration = await this.integrationsService.findByCompanyAndProvider(
      companyId,
      'github',
    );

    if (!integration) {
      throw new BadRequestException('GitHub integration not found');
    }

    const issues = await this.githubService.getRepositoryIssues(
      integration.access_token,
      owner,
      repo,
    );

    return { issues };
  }

  @Get('github/repositories/:owner/:repo/commits')
  async getGithubCommits(
    @Query('companyId') companyId: string,
    @Param('owner') owner: string,
    @Param('repo') repo: string,
    @Query('since') since?: string,
  ) {
    const integration = await this.integrationsService.findByCompanyAndProvider(
      companyId,
      'github',
    );

    if (!integration) {
      throw new BadRequestException('GitHub integration not found');
    }

    const commits = await this.githubService.getRepositoryCommits(
      integration.access_token,
      owner,
      repo,
      since,
    );

    return { commits };
  }

  @Get('github/repositories/:owner/:repo/readme')
  async getGithubReadme(
    @Query('companyId') companyId: string,
    @Param('owner') owner: string,
    @Param('repo') repo: string,
  ) {
    const integration = await this.integrationsService.findByCompanyAndProvider(
      companyId,
      'github',
    );

    if (!integration) {
      throw new BadRequestException('GitHub integration not found');
    }

    const readme = await this.githubService.getRepositoryReadme(
      integration.access_token,
      owner,
      repo,
    );

    return { readme };
  }

  // ==================== Jira Integration ====================

  @Get('jira/authorize')
  async authorizeJira(
    @Query('companyId') companyId: string,
    @Res() res: Response,
  ) {
    if (!companyId) {
      throw new BadRequestException('companyId is required');
    }

    const authUrl = this.jiraService.getAuthorizationUrl(companyId);
    return res.redirect(authUrl);
  }

  @Get('jira/callback')
  async jiraCallback(
    @Query('code') code: string,
    @Query('state') companyId: string,
    @Res() res: Response,
  ) {
    if (!code || !companyId) {
      throw new BadRequestException('Missing code or state');
    }

    try {
      // Exchange code for access token
      const tokenData = await this.jiraService.exchangeCodeForToken(code);

      // Get accessible resources
      const resources =
        await this.jiraService.getAccessibleResources(tokenData.access_token);

      // Calculate token expiration
      const expiresAt = new Date(
        Date.now() + tokenData.expires_in * 1000,
      );

      // Save integration
      await this.integrationsService.create({
        companyId,
        provider: 'jira',
        accessToken: tokenData.access_token,
        refreshToken: tokenData.refresh_token,
        tokenExpiresAt: expiresAt,
        metadata: {
          resources: resources.map((r) => ({
            id: r.id,
            url: r.url,
            name: r.name,
          })),
          scope: tokenData.scope,
        },
      });

      // Redirect to frontend success page
      const frontendUrl = this.configService.get<string>('FRONTEND_URL');
      return res.redirect(
        `${frontendUrl}/company?integration=jira&status=success`,
      );
    } catch (error) {
      const frontendUrl = this.configService.get<string>('FRONTEND_URL');
      return res.redirect(
        `${frontendUrl}/company?integration=jira&status=error&message=${encodeURIComponent(error.message)}`,
      );
    }
  }

  @Get('jira/projects')
  async getJiraProjects(
    @Query('companyId') companyId: string,
    @Query('cloudId') cloudId?: string,
  ) {
    const integration = await this.integrationsService.findByCompanyAndProvider(
      companyId,
      'jira',
    );

    if (!integration) {
      throw new BadRequestException('Jira integration not found');
    }

    // Use first resource if cloudId not provided
    const metadata = integration.metadata as any;
    const targetCloudId = cloudId || metadata?.resources?.[0]?.id;

    if (!targetCloudId) {
      throw new BadRequestException('No Jira cloud resource available');
    }

    const projects = await this.jiraService.getProjects(
      integration.access_token,
      targetCloudId,
    );

    return { projects, cloudId: targetCloudId };
  }

  @Get('jira/projects/:projectKey/issues')
  async getJiraIssues(
    @Query('companyId') companyId: string,
    @Param('projectKey') projectKey: string,
    @Query('cloudId') cloudId?: string,
  ) {
    const integration = await this.integrationsService.findByCompanyAndProvider(
      companyId,
      'jira',
    );

    if (!integration) {
      throw new BadRequestException('Jira integration not found');
    }

    const metadata = integration.metadata as any;
    const targetCloudId = cloudId || metadata?.resources?.[0]?.id;

    if (!targetCloudId) {
      throw new BadRequestException('No Jira cloud resource available');
    }

    const issues = await this.jiraService.getProjectIssues(
      integration.access_token,
      targetCloudId,
      projectKey,
    );

    return { issues };
  }

  @Get('jira/search')
  async searchJiraIssues(
    @Query('companyId') companyId: string,
    @Query('jql') jql: string,
    @Query('cloudId') cloudId?: string,
  ) {
    if (!jql) {
      throw new BadRequestException('jql query is required');
    }

    const integration = await this.integrationsService.findByCompanyAndProvider(
      companyId,
      'jira',
    );

    if (!integration) {
      throw new BadRequestException('Jira integration not found');
    }

    const metadata = integration.metadata as any;
    const targetCloudId = cloudId || metadata?.resources?.[0]?.id;

    if (!targetCloudId) {
      throw new BadRequestException('No Jira cloud resource available');
    }

    const issues = await this.jiraService.searchIssues(
      integration.access_token,
      targetCloudId,
      jql,
    );

    return { issues };
  }

  // ==================== Common Integration Endpoints ====================

  @Get(':companyId')
  async getIntegrations(@Param('companyId') companyId: string) {
    const integrations =
      await this.integrationsService.findAllByCompany(companyId);

    // Remove sensitive tokens from response
    return {
      integrations: integrations.map((i) => ({
        id: i.id,
        provider: i.provider,
        metadata: i.metadata,
        created_at: i.created_at,
        updated_at: i.updated_at,
      })),
    };
  }

  @Delete(':companyId/:provider')
  async deleteIntegration(
    @Param('companyId') companyId: string,
    @Param('provider') provider: 'github' | 'jira',
  ) {
    await this.integrationsService.delete(companyId, provider);
    return { message: 'Integration deleted successfully' };
  }

  // ==================== Project Sync Endpoints ====================

  @Get('github/project-suggestions')
  async getGithubProjectSuggestions(@Query('companyId') companyId: string) {
    const integration = await this.integrationsService.findByCompanyAndProvider(
      companyId,
      'github',
    );

    if (!integration) {
      throw new BadRequestException('GitHub integration not found');
    }

    const suggestions =
      await this.projectSyncService.generateGithubProjectSuggestions(
        integration.access_token,
      );

    return { suggestions };
  }

  @Get('github/repositories/:owner/:repo/description')
  async getDetailedGithubDescription(
    @Query('companyId') companyId: string,
    @Param('owner') owner: string,
    @Param('repo') repo: string,
  ) {
    const integration = await this.integrationsService.findByCompanyAndProvider(
      companyId,
      'github',
    );

    if (!integration) {
      throw new BadRequestException('GitHub integration not found');
    }

    const description =
      await this.projectSyncService.generateDetailedGithubDescription(
        integration.access_token,
        owner,
        repo,
      );

    return { description };
  }

  @Get('jira/project-suggestions')
  async getJiraProjectSuggestions(
    @Query('companyId') companyId: string,
    @Query('cloudId') cloudId?: string,
  ) {
    const integration = await this.integrationsService.findByCompanyAndProvider(
      companyId,
      'jira',
    );

    if (!integration) {
      throw new BadRequestException('Jira integration not found');
    }

    const metadata = integration.metadata as any;
    const targetCloudId = cloudId || metadata?.resources?.[0]?.id;

    if (!targetCloudId) {
      throw new BadRequestException('No Jira cloud resource available');
    }

    const suggestions =
      await this.projectSyncService.generateJiraProjectSuggestions(
        integration.access_token,
        targetCloudId,
      );

    return { suggestions };
  }

  @Get('jira/projects/:projectKey/description')
  async getDetailedJiraDescription(
    @Query('companyId') companyId: string,
    @Param('projectKey') projectKey: string,
    @Query('cloudId') cloudId?: string,
  ) {
    const integration = await this.integrationsService.findByCompanyAndProvider(
      companyId,
      'jira',
    );

    if (!integration) {
      throw new BadRequestException('Jira integration not found');
    }

    const metadata = integration.metadata as any;
    const targetCloudId = cloudId || metadata?.resources?.[0]?.id;

    if (!targetCloudId) {
      throw new BadRequestException('No Jira cloud resource available');
    }

    const description =
      await this.projectSyncService.generateDetailedJiraDescription(
        integration.access_token,
        targetCloudId,
        projectKey,
      );

    return { description };
  }
}
