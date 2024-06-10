interface DateDiff {
  seconds: number;
  minutes: number;
  hours: number;
  days: number;
}

export function getDateDiffs(olderDate: Date, newerDate: Date): DateDiff {
  const diffInSeconds = Math.floor((newerDate.getTime() - olderDate.getTime()) / 1000);

  let seconds;
  let minutes;
  let hours;
  let days;

  minutes = Math.floor(diffInSeconds / 60);
  hours = Math.floor(minutes / 60);
  days = Math.floor(hours / 24);

  hours = hours - days * 24;
  minutes = minutes - days * 24 * 60 - hours * 60;
  seconds = diffInSeconds - days * 24 * 60 * 60 - hours * 60 * 60 - minutes * 60;

  return <DateDiff>{
    seconds,
    minutes,
    hours,
    days
  };
}
