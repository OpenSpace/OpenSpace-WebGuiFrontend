interface LuaApi {
  time: {
    setTime: (timeString: string) => void;
    interpolateTime: (timeString: string) => void;
    interpolateTimeRelative: (delta: number) => void;
  };
}

export function setDate(newTime: Date, luaApi: LuaApi) {
  // Spice, that is handling the time parsing in OpenSpace does not support
  // ISO 8601-style time zones (the Z). It does, however, always assume that UTC
  // is given.
  const fixedTimeString = newTime.toJSON().replace('Z', '');
  luaApi.time.setTime(fixedTimeString);
}

export function setDateRelative(time: string | number | Date, delta: number, luaApi: LuaApi) {
  const newTime = new Date(time);
  newTime.setSeconds(newTime.getSeconds() + delta);
  // Spice, that is handling the time parsing in OpenSpace does not support
  // ISO 8601-style time zones (the Z). It does, however, always assume that UTC
  // is given.
  const fixedTimeString = newTime.toJSON().replace('Z', '');
  luaApi.time.setTime(fixedTimeString);
}

export function interpolateDate(newTime: Date, luaApi: LuaApi) {
  const fixedTimeString = newTime.toJSON().replace('Z', '');
  luaApi.time.interpolateTime(fixedTimeString);
}

export function interpolateDateRelative(delta: number, luaApi: LuaApi) {
  luaApi.time.interpolateTimeRelative(delta);
}

export function timeLabel(time?: Date) {
  return time && time.toUTCString();
}

// export function speedLabel(targetDeltaTime: number, isPaused: boolean) {
//   let increment = Math.abs(targetDeltaTime);
//   const isNegative = Math.sign(targetDeltaTime) === -1;
//   const sign = isNegative ? '-' : '';
//   const units = ['second', 'minute', 'hour', 'day', 'month', 'year'];
//   const conversionFactors = [60, 60, 24, 30, 12];

//   if (increment === 1 && !isNegative) {
//     return `Realtime${isPaused ? ' (Paused)' : ''}`;
//   }

//   let unitIndex = 0;
//   while (unitIndex < conversionFactors.length && increment >= conversionFactors[unitIndex]) {
//     increment /= conversionFactors[unitIndex];
//     unitIndex++;
//   }

//   increment = Math.round(increment);
//   const unit = units[unitIndex];
//   const pluralSuffix = increment !== 1 ? 's' : '';

//   return `${sign + increment} ${unit}${pluralSuffix} / second${isPaused ? ' (Paused)' : ''}`;
// }

export function speedLabel(targetDeltaTime: number, isPaused: boolean) {
  let increment = Math.abs(targetDeltaTime);
  const isNegative = Math.sign(targetDeltaTime) === -1;
  const sign = isNegative ? '-' : '';
  let unit = 'second';

  // Refactor this to use a loop or cleaner conditionals if possible
  // Handling the conversion from seconds up to years
  if (increment === 1 && !isNegative) {
    return `Realtime${isPaused ? ' (Paused)' : ''}`;
  }

  if (increment >= 60) {
    increment /= 60;
    unit = 'minute';
    if (increment >= 60) {
      increment /= 60;
      unit = 'hour';
      if (increment >= 24) {
        increment /= 24;
        unit = 'day';
        if (increment >= 30) {
          increment /= 30;
          unit = 'month';
          if (increment >= 12) {
            increment /= 12;
            unit = 'year';
          }
        }
      }
    }
  }

  increment = Math.round(increment);
  const pluralSuffix = increment !== 1 ? 's' : '';
  return `${sign + increment} ${unit}${pluralSuffix} / second${isPaused ? ' (Paused)' : ''}`;
}
