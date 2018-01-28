import { Organization } from '../organization/organization.model';

export class Offer {
    id: number;
    image: string;
    location: string;
    organization: Organization;
    slug: string;
    startedAt: string | null;
    finishedAt: string | null;
    title: string;
    url: string;
    recruitmentEndDate: string | null;
    timeCommitment: string;
    requirements: string;
    benefits: string;
    description: string;
    recruitmentStartDate: string | null;
    reserveRecruitment: boolean;
    reserveRecruitmentStartDate: string | null;
    reserveRecruitmentEndDate: string | null;
    actionOngoing: boolean;
    constantCoop: boolean;
    volunteersLimit: number;
    reserveVolunteersLimit: number;
}
