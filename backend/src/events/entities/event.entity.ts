export class Event {
    id: number;
    name: string;             
    description: string;
    date: Date;
    location: string;
    createdAt: Date;
    updatedAt: Date;
    constructor(partial: Partial<Event>) {
        Object.assign(this, partial);
    }
}