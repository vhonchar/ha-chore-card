import { HassEntity, HassEntityAttributeBase } from 'home-assistant-js-websocket';

export interface ScheduledChoreEntity extends HassEntity {
  attributes: HassEntityAttributeBase & {
    last_completion_date: string;
    next_due_date: string;
  };
}

export interface CounterChoreEntity extends HassEntity {
  attributes: HassEntityAttributeBase & {
    counter_state: number;
    limit: number;
  };
}

export const isScheduledChore = (obj: any): obj is ScheduledChoreEntity => {
  return obj.attributes.next_due_date;
};
