import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CompanyMember, CompanyRole } from '@prisma/client';

export interface InviteMemberDto {
  companyId: string;
  email: string;
  role: CompanyRole;
  invitedBy: string;
}

export interface UpdateMemberRoleDto {
  companyId: string;
  userId: string;
  role: CompanyRole;
  updatedBy: string;
}

@Injectable()
export class TeamService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Check if user has access to company
   */
  async hasAccess(userId: string, companyId: string): Promise<boolean> {
    const member = await this.prisma.companyMember.findUnique({
      where: {
        company_id_user_id: {
          company_id: companyId,
          user_id: userId,
        },
      },
    });

    return !!member;
  }

  /**
   * Check if user has specific role or higher
   */
  async hasRole(
    userId: string,
    companyId: string,
    requiredRole: CompanyRole,
  ): Promise<boolean> {
    const member = await this.prisma.companyMember.findUnique({
      where: {
        company_id_user_id: {
          company_id: companyId,
          user_id: userId,
        },
      },
    });

    if (!member) return false;

    const roleHierarchy = {
      VIEWER: 0,
      MEMBER: 1,
      ADMIN: 2,
      OWNER: 3,
    };

    return roleHierarchy[member.role] >= roleHierarchy[requiredRole];
  }

  /**
   * Get user's role in company
   */
  async getUserRole(
    userId: string,
    companyId: string,
  ): Promise<CompanyRole | null> {
    const member = await this.prisma.companyMember.findUnique({
      where: {
        company_id_user_id: {
          company_id: companyId,
          user_id: userId,
        },
      },
    });

    return member?.role || null;
  }

  /**
   * Get all members of a company
   */
  async getCompanyMembers(companyId: string): Promise<CompanyMember[]> {
    return this.prisma.companyMember.findMany({
      where: { company_id: companyId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            created_at: true,
          },
        },
        inviter: {
          select: {
            id: true,
            email: true,
          },
        },
      },
      orderBy: [{ role: 'desc' }, { joined_at: 'asc' }],
    });
  }

  /**
   * Invite a user to company
   */
  async inviteMember(data: InviteMemberDto): Promise<CompanyMember> {
    // Check if inviter has permission (must be ADMIN or OWNER)
    const hasPermission = await this.hasRole(
      data.invitedBy,
      data.companyId,
      'ADMIN',
    );

    if (!hasPermission) {
      throw new ForbiddenException(
        'Only admins and owners can invite members',
      );
    }

    // Find user by email
    const user = await this.prisma.user.findUnique({
      where: { email: data.email },
    });

    if (!user) {
      throw new NotFoundException(`User with email ${data.email} not found`);
    }

    // Check if user is already a member
    const existingMember = await this.prisma.companyMember.findUnique({
      where: {
        company_id_user_id: {
          company_id: data.companyId,
          user_id: user.id,
        },
      },
    });

    if (existingMember) {
      throw new BadRequestException('User is already a member of this company');
    }

    // Prevent inviting as OWNER (only one owner allowed)
    if (data.role === 'OWNER') {
      throw new BadRequestException('Cannot invite user as OWNER');
    }

    // Create member
    return this.prisma.companyMember.create({
      data: {
        company_id: data.companyId,
        user_id: user.id,
        role: data.role,
        invited_by: data.invitedBy,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            created_at: true,
          },
        },
      },
    });
  }

  /**
   * Update member role
   */
  async updateMemberRole(data: UpdateMemberRoleDto): Promise<CompanyMember> {
    // Check if updater has permission (must be OWNER)
    const hasPermission = await this.hasRole(
      data.updatedBy,
      data.companyId,
      'OWNER',
    );

    if (!hasPermission) {
      throw new ForbiddenException('Only owners can change member roles');
    }

    // Cannot change owner role
    const member = await this.prisma.companyMember.findUnique({
      where: {
        company_id_user_id: {
          company_id: data.companyId,
          user_id: data.userId,
        },
      },
    });

    if (!member) {
      throw new NotFoundException('Member not found');
    }

    if (member.role === 'OWNER') {
      throw new BadRequestException('Cannot change owner role');
    }

    if (data.role === 'OWNER') {
      throw new BadRequestException('Cannot promote member to owner');
    }

    // Update role
    return this.prisma.companyMember.update({
      where: {
        company_id_user_id: {
          company_id: data.companyId,
          user_id: data.userId,
        },
      },
      data: {
        role: data.role,
        updated_at: new Date(),
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            created_at: true,
          },
        },
      },
    });
  }

  /**
   * Remove member from company
   */
  async removeMember(
    companyId: string,
    userId: string,
    removedBy: string,
  ): Promise<void> {
    // Check if remover has permission (must be ADMIN or OWNER)
    const hasPermission = await this.hasRole(removedBy, companyId, 'ADMIN');

    if (!hasPermission) {
      throw new ForbiddenException(
        'Only admins and owners can remove members',
      );
    }

    // Cannot remove owner
    const member = await this.prisma.companyMember.findUnique({
      where: {
        company_id_user_id: {
          company_id: companyId,
          user_id: userId,
        },
      },
    });

    if (!member) {
      throw new NotFoundException('Member not found');
    }

    if (member.role === 'OWNER') {
      throw new BadRequestException('Cannot remove company owner');
    }

    // Remove member
    await this.prisma.companyMember.delete({
      where: {
        company_id_user_id: {
          company_id: companyId,
          user_id: userId,
        },
      },
    });
  }

  /**
   * Leave company (self-removal)
   */
  async leaveCompany(companyId: string, userId: string): Promise<void> {
    const member = await this.prisma.companyMember.findUnique({
      where: {
        company_id_user_id: {
          company_id: companyId,
          user_id: userId,
        },
      },
    });

    if (!member) {
      throw new NotFoundException('You are not a member of this company');
    }

    if (member.role === 'OWNER') {
      throw new BadRequestException(
        'Owner cannot leave company. Transfer ownership first.',
      );
    }

    await this.prisma.companyMember.delete({
      where: {
        company_id_user_id: {
          company_id: companyId,
          user_id: userId,
        },
      },
    });
  }

  /**
   * Transfer ownership
   */
  async transferOwnership(
    companyId: string,
    newOwnerId: string,
    currentOwnerId: string,
  ): Promise<void> {
    // Verify current owner
    const isOwner = await this.hasRole(currentOwnerId, companyId, 'OWNER');

    if (!isOwner) {
      throw new ForbiddenException('Only owner can transfer ownership');
    }

    // Verify new owner is a member
    const newOwnerMember = await this.prisma.companyMember.findUnique({
      where: {
        company_id_user_id: {
          company_id: companyId,
          user_id: newOwnerId,
        },
      },
    });

    if (!newOwnerMember) {
      throw new NotFoundException('New owner must be a company member');
    }

    // Transfer ownership in transaction
    await this.prisma.$transaction([
      // Demote current owner to admin
      this.prisma.companyMember.update({
        where: {
          company_id_user_id: {
            company_id: companyId,
            user_id: currentOwnerId,
          },
        },
        data: { role: 'ADMIN' },
      }),
      // Promote new owner
      this.prisma.companyMember.update({
        where: {
          company_id_user_id: {
            company_id: companyId,
            user_id: newOwnerId,
          },
        },
        data: { role: 'OWNER' },
      }),
      // Update company user_id
      this.prisma.company.update({
        where: { id: companyId },
        data: { user_id: newOwnerId },
      }),
    ]);
  }

  /**
   * Get companies user has access to
   */
  async getUserCompanies(userId: string) {
    const memberships = await this.prisma.companyMember.findMany({
      where: { user_id: userId },
      include: {
        company: {
          include: {
            _count: {
              select: {
                members: true,
                projects: true,
                expenses: true,
              },
            },
          },
        },
      },
      orderBy: { joined_at: 'desc' },
    });

    return memberships.map((m) => ({
      ...m.company,
      role: m.role,
      joined_at: m.joined_at,
    }));
  }
}
