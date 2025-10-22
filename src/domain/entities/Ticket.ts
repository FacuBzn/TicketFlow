import { v4 as uuidv4 } from 'uuid';

// Keep legacy types for backward compatibility
export type TicketStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
export type TicketPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

/**
 * Ticket aggregate root entity
 * Encapsulates business rules and state transitions
 */
export class Ticket {
  public readonly id: string;
  public readonly title: string;
  public readonly description: string;
  public readonly createdAt: Date;
  
  private _status: TicketStatus;
  private _priority: TicketPriority;
  private _urgencyScore: number;
  private _updatedAt: Date;

  constructor(
    title: string,
    description: string,
    status?: TicketStatus,
    priority?: TicketPriority,
    urgencyScore?: number,
    id?: string,
    createdAt?: Date,
    updatedAt?: Date
  ) {
    this.id = id || uuidv4();
    this.title = title;
    this.description = description;
    this.createdAt = createdAt || new Date();
    this._updatedAt = updatedAt || new Date();
    this._status = status || 'OPEN';
    this._priority = priority || 'LOW';
    this._urgencyScore = urgencyScore ?? 0;
  }

  // Getters
  get status(): TicketStatus {
    return this._status;
  }

  get priority(): TicketPriority {
    return this._priority;
  }

  get urgencyScore(): number {
    return this._urgencyScore;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }

  /**
   * Factory method to create a new ticket with LLM classification
   */
  static create(
    title: string,
    description: string,
    urgencyScore: number
  ): Ticket {
    const priority = Ticket.mapUrgencyToPriority(urgencyScore);
    return new Ticket(title, description, 'OPEN', priority, urgencyScore);
  }

  /**
   * Reclassify ticket with new urgency score
   * Updates both urgency score and derived priority
   */
  reclassify(newUrgencyScore: number): void {
    if (newUrgencyScore < 0 || newUrgencyScore > 1) {
      throw new Error('Urgency score must be between 0 and 1');
    }
    this._urgencyScore = newUrgencyScore;
    this._priority = Ticket.mapUrgencyToPriority(newUrgencyScore);
    this._updatedAt = new Date();
  }

  /**
   * Update ticket status
   * Note: State transition validation should be done by StateTransitionValidator
   */
  updateStatus(newStatus: TicketStatus): void {
    this._status = newStatus;
    this._updatedAt = new Date();
  }

  /**
   * Close the ticket
   */
  close(): void {
    this._status = 'CLOSED';
    this._updatedAt = new Date();
  }

  /**
   * Check if ticket is closed
   */
  isClosed(): boolean {
    return this._status === 'CLOSED';
  }

  /**
   * Check if ticket is open
   */
  isOpen(): boolean {
    return this._status === 'OPEN';
  }

  /**
   * Check if priority is critical
   */
  isCritical(): boolean {
    return this._priority === 'CRITICAL';
  }

  /**
   * Map urgency score to priority
   * Rules:
   * - 0.00-0.25 → LOW
   * - 0.26-0.50 → MEDIUM
   * - 0.51-0.75 → HIGH
   * - 0.76-1.00 → CRITICAL
   */
  private static mapUrgencyToPriority(score: number): TicketPriority {
    if (score <= 0.25) return 'LOW';
    if (score <= 0.5) return 'MEDIUM';
    if (score <= 0.75) return 'HIGH';
    return 'CRITICAL';
  }
}

