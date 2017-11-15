export class Offer {
    id: number;
    image: string;
    location: string;
    organization: {
        id: number,
        slug: string,
        nume: string,
        url: string,
    },
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
}
