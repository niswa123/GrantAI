import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface JiraProject {
  id: string;
  key: string;
  name: string;
  description?: string;
  projectTypeKey: string;
  lead: {
    displayName: string;
  };
}

export interface JiraIssue {
  id: string;
  key: string;
  fields: {
    summary: string;
    description?: any;
    status: {
      name: string;
    };
    issuetype: {
      name: string;
    };
    created: string;
    updated: string;
    priority?: {
      name: string;
    };
    labels: string[];
  };
}

export interface JiraCloudResource {
  id: string;
  url: string;
  name: string;
  scopes: string[];
}

@Injectable()
export class JiraService {
  private readonly clientId: string;
  private readonly clientSecret: string;
  private readonly callbackUrl: string;

  constructor(private readonly configService: ConfigService) {
    this.clientId = this.configService.get<string>('JIRA_CLIENT_ID') || '';
    this.clientSecret =
      this.configService.get<string>('JIRA_CLIENT_SECRET') || '';
    this.callbackUrl =
      this.configService.get<string>('JIRA_CALLBACK_URL') || '';
  }

  getAuthorizationUrl(state: string): string {
    const params = new URLSearchParams({
      audience: 'api.atlassian.com',
      client_id: this.clientId,
      scope: 'read:jira-work read:jira-user offline_access',
      redirect_uri: this.callbackUrl,
      state,
      response_type: 'code',
      prompt: 'consent',
    });

    return `https://auth.atlassian.com/authorize?${params.toString()}`;
  }

  async exchangeCodeForToken(code: string): Promise<{
    access_token: string;
    refresh_token: string;
    expires_in: number;
    scope: string;
  }> {
    const response = await fetch('https://auth.atlassian.com/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        grant_type: 'authorization_code',
        client_id: this.clientId,
        client_secret: this.clientSecret,
        code,
        redirect_uri: this.callbackUrl,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new BadRequestException(
        `Failed to exchange code for token: ${error}`,
      );
    }

    return response.json();
  }

  async refreshAccessToken(refreshToken: string): Promise<{
    access_token: string;
    refresh_token: string;
    expires_in: number;
  }> {
    const response = await fetch('https://auth.atlassian.com/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        grant_type: 'refresh_token',
        client_id: this.clientId,
        client_secret: this.clientSecret,
        refresh_token: refreshToken,
      }),
    });

    if (!response.ok) {
      throw new UnauthorizedException('Failed to refresh access token');
    }

    return response.json();
  }

  async getAccessibleResources(
    accessToken: string,
  ): Promise<JiraCloudResource[]> {
    const response = await fetch(
      'https://api.atlassian.com/oauth/token/accessible-resources',
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: 'application/json',
        },
      },
    );

    if (!response.ok) {
      throw new UnauthorizedException('Failed to fetch accessible resources');
    }

    return response.json();
  }

  async getProjects(
    accessToken: string,
    cloudId: string,
  ): Promise<JiraProject[]> {
    const response = await fetch(
      `https://api.atlassian.com/ex/jira/${cloudId}/rest/api/3/project/search`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: 'application/json',
        },
      },
    );

    if (!response.ok) {
      throw new BadRequestException('Failed to fetch Jira projects');
    }

    const data = await response.json();
    return data.values || [];
  }

  async getProjectIssues(
    accessToken: string,
    cloudId: string,
    projectKey: string,
  ): Promise<JiraIssue[]> {
    const jql = `project = ${projectKey} ORDER BY created DESC`;
    const response = await fetch(
      `https://api.atlassian.com/ex/jira/${cloudId}/rest/api/3/search?jql=${encodeURIComponent(jql)}&maxResults=100`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: 'application/json',
        },
      },
    );

    if (!response.ok) {
      throw new BadRequestException('Failed to fetch project issues');
    }

    const data = await response.json();
    return data.issues || [];
  }

  async searchIssues(
    accessToken: string,
    cloudId: string,
    jql: string,
  ): Promise<JiraIssue[]> {
    const response = await fetch(
      `https://api.atlassian.com/ex/jira/${cloudId}/rest/api/3/search?jql=${encodeURIComponent(jql)}&maxResults=100`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: 'application/json',
        },
      },
    );

    if (!response.ok) {
      throw new BadRequestException('Failed to search issues');
    }

    const data = await response.json();
    return data.issues || [];
  }
}
