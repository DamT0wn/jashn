import type { Task } from '@jashn/contracts';
export function taskLocalDate(task:Task,zone:string) {
  if(task.schedule.kind==='date')return task.schedule.localDate;
  return dateInZone(new Date(task.schedule.endsAt),zone);
}
export function dateInZone(now:Date,zone:string) {
  const parts=new Intl.DateTimeFormat('en',{timeZone:zone,year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(now);
  return ['year','month','day'].map(kind=>parts.find(part=>part.type===kind)!.value).join('-');
}
export function taskOverdue(task:Task,zone:string,now:Date) {
  return task.status!=='done'&&(task.schedule.kind==='timed'?Date.parse(task.schedule.endsAt)<now.getTime():task.schedule.localDate<dateInZone(now,zone));
}
export function taskScheduleLabel(task:Task) {
  if(task.schedule.kind==='date')return task.schedule.localDate;
  const format=new Intl.DateTimeFormat('en-IN',{timeZone:task.timezone,dateStyle:'medium',timeStyle:'short'});
  return `${format.format(new Date(task.schedule.startsAt))} - ${format.format(new Date(task.schedule.endsAt))} (${task.timezone})`;
}
