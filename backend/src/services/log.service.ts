import prisma from '../config/database';

export interface CreateLogData {
  type: 'send' | 'receive';
  fileId: string;
  contactId: string;
  status: 'success' | 'failed';
  errorMessage?: string;
}

export interface LogFilters {
  type?: string;
  status?: string;
  contactId?: string;
  fileId?: string;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
}

class LogService {
  async createLog(data: CreateLogData): Promise<any> {
    return prisma.log.create({
      data: {
        type: data.type,
        fileId: data.fileId,
        contactId: data.contactId,
        status: data.status,
        errorMessage: data.errorMessage || null,
      },
      include: {
        file: true,
        contact: true,
      },
    });
  }

  async getLogs(filters: LogFilters): Promise<any[]> {
    const where: any = {};

    if (filters.type) {
      where.type = filters.type;
    }

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.contactId) {
      where.contactId = filters.contactId;
    }

    if (filters.fileId) {
      where.fileId = filters.fileId;
    }

    if (filters.startDate || filters.endDate) {
      where.timestamp = {};
      if (filters.startDate) {
        where.timestamp.gte = filters.startDate;
      }
      if (filters.endDate) {
        where.timestamp.lte = filters.endDate;
      }
    }

    return prisma.log.findMany({
      where,
      include: {
        file: true,
        contact: true,
      },
      orderBy: {
        timestamp: 'desc',
      },
      take: filters.limit || 100,
      skip: filters.offset || 0,
    });
  }

  async getLogById(id: string): Promise<any | null> {
    return prisma.log.findUnique({
      where: { id },
      include: {
        file: true,
        contact: true,
      },
    });
  }

  async exportLogsAsCSV(): Promise<string> {
    const logs = await prisma.log.findMany({
      include: {
        file: true,
        contact: true,
      },
      orderBy: {
        timestamp: 'desc',
      },
    });

    const headers = ['ID', 'Type', 'Status', 'Timestamp', 'File Name', 'Contact Name', 'Error Message'];
    const rows = logs.map(log => [
      log.id,
      log.type,
      log.status,
      log.timestamp.toISOString(),
      log.file.originalName,
      log.contact.name,
      log.errorMessage || '',
    ]);

    const csv = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')),
    ].join('\n');

    return csv;
  }
}

export const logService = new LogService();
