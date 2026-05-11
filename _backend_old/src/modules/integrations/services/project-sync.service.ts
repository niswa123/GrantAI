import { Injectable } from '@nestjs/common';
import { GithubService, GithubRepository, GithubIssue } from './github.service';
import { JiraService, JiraProject, JiraIssue } from './jira.service';

export interface ProjectSuggestion {
  title: string;
  description: string;
  source: 'github' | 'jira';
  sourceId: string;
  metadata: any;
}

@Injectable()
export class ProjectSyncService {
  constructor(
    private readonly githubService: GithubService,
    private readonly jiraService: JiraService,
  ) {}

  /**
   * Generate project suggestions from GitHub repositories
   */
  async generateGithubProjectSuggestions(
    accessToken: string,
  ): Promise<ProjectSuggestion[]> {
    const repositories =
      await this.githubService.getRepositories(accessToken);

    return repositories.map((repo) => ({
      title: repo.name,
      description: this.buildGithubDescription(repo),
      source: 'github' as const,
      sourceId: repo.id.toString(),
      metadata: {
        full_name: repo.full_name,
        html_url: repo.html_url,
        language: repo.language,
        stars: repo.stargazers_count,
        updated_at: repo.updated_at,
      },
    }));
  }

  /**
   * Generate detailed project description from GitHub repository
   */
  async generateDetailedGithubDescription(
    accessToken: string,
    owner: string,
    repo: string,
  ): Promise<string> {
    const [repository, issues, commits, readme] = await Promise.all([
      this.githubService
        .getRepositories(accessToken)
        .then((repos) => repos.find((r) => r.full_name === `${owner}/${repo}`)),
      this.githubService.getRepositoryIssues(accessToken, owner, repo),
      this.githubService.getRepositoryCommits(accessToken, owner, repo),
      this.githubService.getRepositoryReadme(accessToken, owner, repo),
    ]);

    let description = '';

    if (repository) {
      description += `# ${repository.name}\n\n`;
      if (repository.description) {
        description += `${repository.description}\n\n`;
      }
      description += `**Language:** ${repository.language || 'N/A'}\n`;
      description += `**Stars:** ${repository.stargazers_count}\n\n`;
    }

    if (readme) {
      description += `## Project Overview\n${readme.substring(0, 500)}...\n\n`;
    }

    if (commits.length > 0) {
      description += `## Recent Activity\n`;
      description += `- Total commits analyzed: ${commits.length}\n`;
      description += `- Latest commit: ${commits[0].commit.message}\n`;
      description += `- Last updated: ${commits[0].commit.author.date}\n\n`;
    }

    if (issues.length > 0) {
      const openIssues = issues.filter((i) => i.state === 'open');
      description += `## Issues\n`;
      description += `- Open issues: ${openIssues.length}\n`;
      description += `- Total issues: ${issues.length}\n\n`;

      // Add key technical labels
      const technicalLabels = this.extractTechnicalLabels(issues);
      if (technicalLabels.length > 0) {
        description += `**Technical Focus Areas:** ${technicalLabels.join(', ')}\n\n`;
      }
    }

    return description;
  }

  /**
   * Generate project suggestions from Jira projects
   */
  async generateJiraProjectSuggestions(
    accessToken: string,
    cloudId: string,
  ): Promise<ProjectSuggestion[]> {
    const projects = await this.jiraService.getProjects(accessToken, cloudId);

    return projects.map((project) => ({
      title: `${project.key}: ${project.name}`,
      description: this.buildJiraDescription(project),
      source: 'jira' as const,
      sourceId: project.id,
      metadata: {
        key: project.key,
        projectTypeKey: project.projectTypeKey,
        lead: project.lead.displayName,
      },
    }));
  }

  /**
   * Generate detailed project description from Jira project
   */
  async generateDetailedJiraDescription(
    accessToken: string,
    cloudId: string,
    projectKey: string,
  ): Promise<string> {
    const [projects, issues] = await Promise.all([
      this.jiraService.getProjects(accessToken, cloudId),
      this.jiraService.getProjectIssues(accessToken, cloudId, projectKey),
    ]);

    const project = projects.find((p) => p.key === projectKey);

    let description = '';

    if (project) {
      description += `# ${project.name} (${project.key})\n\n`;
      if (project.description) {
        description += `${project.description}\n\n`;
      }
      description += `**Project Type:** ${project.projectTypeKey}\n`;
      description += `**Lead:** ${project.lead.displayName}\n\n`;
    }

    if (issues.length > 0) {
      const issuesByType = this.groupIssuesByType(issues);
      const issuesByStatus = this.groupIssuesByStatus(issues);

      description += `## Project Statistics\n`;
      description += `- Total issues: ${issues.length}\n\n`;

      description += `### Issues by Type\n`;
      Object.entries(issuesByType).forEach(([type, count]) => {
        description += `- ${type}: ${count}\n`;
      });
      description += `\n`;

      description += `### Issues by Status\n`;
      Object.entries(issuesByStatus).forEach(([status, count]) => {
        description += `- ${status}: ${count}\n`;
      });
      description += `\n`;

      // Extract common labels
      const commonLabels = this.extractCommonLabels(issues);
      if (commonLabels.length > 0) {
        description += `**Key Labels:** ${commonLabels.join(', ')}\n\n`;
      }

      // Add recent issues
      description += `## Recent Issues\n`;
      issues.slice(0, 5).forEach((issue) => {
        description += `- [${issue.key}] ${issue.fields.summary} (${issue.fields.status.name})\n`;
      });
    }

    return description;
  }

  // ==================== Helper Methods ====================

  private buildGithubDescription(repo: GithubRepository): string {
    let desc = repo.description || 'No description available';

    if (repo.language) {
      desc += `\n\nPrimary Language: ${repo.language}`;
    }

    desc += `\nLast Updated: ${new Date(repo.updated_at).toLocaleDateString()}`;

    return desc;
  }

  private buildJiraDescription(project: JiraProject): string {
    let desc = project.description || 'No description available';
    desc += `\n\nProject Type: ${project.projectTypeKey}`;
    desc += `\nProject Lead: ${project.lead.displayName}`;
    return desc;
  }

  private extractTechnicalLabels(issues: GithubIssue[]): string[] {
    const labelCounts = new Map<string, number>();

    issues.forEach((issue) => {
      issue.labels.forEach((label) => {
        const count = labelCounts.get(label.name) || 0;
        labelCounts.set(label.name, count + 1);
      });
    });

    // Return top 5 most common labels
    return Array.from(labelCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([label]) => label);
  }

  private groupIssuesByType(issues: JiraIssue[]): Record<string, number> {
    const groups: Record<string, number> = {};

    issues.forEach((issue) => {
      const type = issue.fields.issuetype.name;
      groups[type] = (groups[type] || 0) + 1;
    });

    return groups;
  }

  private groupIssuesByStatus(issues: JiraIssue[]): Record<string, number> {
    const groups: Record<string, number> = {};

    issues.forEach((issue) => {
      const status = issue.fields.status.name;
      groups[status] = (groups[status] || 0) + 1;
    });

    return groups;
  }

  private extractCommonLabels(issues: JiraIssue[]): string[] {
    const labelCounts = new Map<string, number>();

    issues.forEach((issue) => {
      issue.fields.labels.forEach((label) => {
        const count = labelCounts.get(label) || 0;
        labelCounts.set(label, count + 1);
      });
    });

    // Return top 5 most common labels
    return Array.from(labelCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([label]) => label);
  }
}
