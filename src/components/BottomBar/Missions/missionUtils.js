export function makeUtcDate(time) {
  if (!time) {
    return null;
  }
  const utcString = time.includes('Z') ? time : `${time}Z`;
  return new Date(utcString);
}

export const DisplayType = {
  phase: 'phase',
  milestone: 'milestone'
};
