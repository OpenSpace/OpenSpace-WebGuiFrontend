import {SetDeltaTimeScript, TogglePauseScript, ValuePlaceholder} from "../api/keys";

export const togglePause = (luaApi) => {
  luaApi.time.togglePause();
};

export const realtime = (luaApi) => {
  luaApi.time.setDeltaTime(1);
};

export const setDateToNow = (luaApi) => {
  const now = new Date().toISOString();
  setDate(luaApi, now);
  UpdateDeltaTimeNow(luaApi, 1);
};

// Spice, that is handling the time parsing in OpenSpace does not support
// ISO 8601-style time zones (the Z). It does, however, always assume that UTC
// is given.
export const setDate = (luaApi, time) => {
  const fixedTimeString = time.toString().replace('Z', '');
  luaApi.time.setTime(fixedTimeString);
};

/**
 * Make sure the date string contains a time zone
 * @param date
 * @param zone - the time zone in ISO 8601 format
 * @constructor
 */
export const DateStringWithTimeZone = (date, zone = 'Z') => {
  return (!date.includes('Z') ? `${date}${zone}` : date);
};

export const UpdateDeltaTimeNow = (luaApi, value) => {
  luaApi.time.setDeltaTime(value);
};

export const sortDates = (dateList) => {
  dateList.sort((date1, date2) => (new Date(date1.date) - (new Date(date2.date))));
};
