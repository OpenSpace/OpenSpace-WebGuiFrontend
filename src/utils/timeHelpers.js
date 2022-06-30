import {SetDeltaTimeScript, TogglePauseScript, ValuePlaceholder} from "../api/keys";

export const togglePause = (luaApi) => {
  luaApi.time.togglePause();
};

export const realtime = (luaApi) => {
  luaApi.time.setDeltaTime(1);
};

export const setDateToNow = (luaApi) => {
  const now = new Date();
  setDate(luaApi, now);
  UpdateDeltaTimeNow(luaApi, 1);
};

/**
* SPICE, that is handling the time parsing in OpenSpace assumes UTC time.
* It does not accept ISO 8601-style time zones (the Z)
* @param luaApi
* @param time - string assumed to be in UTC
*/
export const setDate = (luaApi, date) => {

  // date.toJSON returns a UTC format string including timezone 'Z'
  // but the lua api only accepts a UTC string without time zone
  const fixedDateString = JSON.stringify(date).replace('Z', '');
    console.log("time " + fixedDateString)
  luaApi.time.setTime(fixedDateString);
};

/**
 * Make sure the date string contains a time zone. When
 * creating a javascript Date, the browser will interpret
 * all date strings as local time, unless specifying the
 * timezone as 'Z' which will interpret it as UTC
 * @param date - date string with or without timezone 'Z'
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
