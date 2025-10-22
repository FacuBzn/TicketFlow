import { v4 as uuidv4 } from 'uuid';

export type TicketStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
export type TicketPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export class Ticket {
  public readonly id: string;
  public readonly createdAt: Date;
  public updatedAt: Date;
  public status: TicketStatus;
  public priority: TicketPriority;
  public urgencyScore: number;
  constructor(
    public readonly title: string,
    public readonly description: string,
    status?: TicketStatus,
    priority?: TicketPriority,
    urgencyScore?: number,
    id?: string,
    createdAt?: Date,
    updatedAt?: Date
  ) {
    this.id = id || uuidv4();
    this.createdAt = createdAt || new Date();
    this.updatedAt = updatedAt || new Date();
    this.status = status || 'OPEN';
    this.priority = priority || 'LOW';
    this.urgencyScore = urgencyScore ?? 0;
  }
}

