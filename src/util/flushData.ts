import { prisma } from '../providers/prisma';

prisma.$executeRaw`DELETE FROM HackathonTeams; DELETE FROM Participants; DELETE FROM HackathonAudits;`;
