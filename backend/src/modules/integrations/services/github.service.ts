import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface GithubRepository {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  language: string | null;
  stargazers_count: number;
  updated_at: string;
}

export interface GithubIssue {
  id: number;
  number: number;
  title: string;
  body: string | null;
  state: string;
  html_url: string;
  created_at: string;
  updated_at: string;
  labels: Array<{ name: string; color: string }>;
}

export interface GithubCommit {
  sha: string;
  commit: {
    message: string;
    author: {
      name: string;
      date: string;
    };
  };
  html_url: string;
}

@Injectable()
export class GithubService {
  private readonly clientId: string;
  private readonly clientSecret: string;
  private readonly callbackUrl: string;

  constructor(private readonly configService: ConfigService) {
    this.clientId = this.configService.get<string>('GITHUB_CLIENT_ID') || '';
    this.clientSecret =
      this.configService.get<string>('GITHUB_CLIENT_SECRET') || '';
    this.callbackUrl =
      this.configService.get<string>('GITHUB_CALLBACK_URL') || '';
  }

  getAuthorizationUrl(state: string): string {
    const params = new URLSearchParams({
      client_id: this.clientId,
      redirect_uri: this.callbackUrl,
      scope: 'repo read:user',
      state,
    });

    return `https://github.com/login/oauth/authorize?${params.toString()}`;
  }

  async exchangeCodeForToken(code: string): Promise<{
    access_token: string;
    token_type: string;
    scope: string;
  }> {
    const response = await fetch(
      'https://github.com/login/oauth/access_token',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          client_id: this.clientId,
          client_secret: this.clientSecret,
          code,
          redirect_uri: this.callbackUrl,
        }),
      },
    );

    if (!response.ok) {
      throw new BadRequestException('Failed to exchange code for token');
    }

    const data = await response.json();

    if (data.error) {
      throw new BadRequestException(data.error_description || data.error);
    }

    return data;
  }

  async getUser(accessToken: string): Promise<{
    id: number;
    login: string;
    name: string;
    email: string;
  }> {
    const response = await fetch('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/vnd.github.v3+json',
      },
    });

    if (!response.ok) {
      throw new UnauthorizedException('Invalid GitHub access token');
    }

    return response.json();
  }

  async getRepositories(accessToken: string): Promise<GithubRepository[]> {
    const response = await fetch(
      'https://api.github.com/user/repos?sort=updated&per_page=100',
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: 'application/vnd.github.v3+json',
        },
      },
    );

    if (!response.ok) {
      throw new UnauthorizedException('Failed to fetch repositories');
    }

    return response.json();
  }

  async getRepositoryIssues(
    accessToken: string,
    owner: string,
    repo: string,
  ): Promise<GithubIssue[]> {
    const response = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/issues?state=all&per_page=100`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: 'application/vnd.github.v3+json',
        },
      },
    );

    if (!response.ok) {
      throw new BadRequestException('Failed to fetch repository issues');
    }

    return response.json();
  }

  async getRepositoryCommits(
    accessToken: string,
    owner: string,
    repo: string,
    since?: string,
  ): Promise<GithubCommit[]> {
    const url = new URL(
      `https://api.github.com/repos/${owner}/${repo}/commits`,
    );
    url.searchParams.set('per_page', '100');
    if (since) {
      url.searchParams.set('since', since);
    }

    const response = await fetch(url.toString(), {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/vnd.github.v3+json',
      },
    });

    if (!response.ok) {
      throw new BadRequestException('Failed to fetch repository commits');
    }

    return response.json();
  }

  async getRepositoryReadme(
    accessToken: string,
    owner: string,
    repo: string,
  ): Promise<string | null> {
    try {
      const response = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/readme`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            Accept: 'application/vnd.github.v3.raw',
          },
        },
      );

      if (!response.ok) {
        return null;
      }

      return response.text();
    } catch {
      return null;
    }
  }
}
