import { prisma } from '../providers/prisma';

async function flushData() {
	await prisma.hackathonAudit.deleteMany({});
	await prisma.hackathonTeam.deleteMany({});
	await prisma.participant.deleteMany({});
}

flushData();
