export type Priority = 'LOW' | 'MEDIUM' | 'HIGH'
export type Status = 'PENDING' | 'CLOSED'

export interface IReminder {
    date: Date | string,
    reminderDate: Date | string,
    nextReminderDate?: Date | string,
    priority?: Priority,
    description?: string,
    status: Status,
    statusNote?: string
}