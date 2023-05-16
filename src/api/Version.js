export const WebGuiVersion = {
  major: 0,
  minor: 2,
  patch: 0
};

export const RequiredSocketApiVersion = {
  major: 0,
  minor: 1,
  patch: 0
};

export const RequiredOpenSpaceVersion = {
  major: 0,
  minor: 14,
  patch: 0
};

export const isCompatible = (actualVersion, requiredVersion) => actualVersion.major === requiredVersion.major &&
  actualVersion.minor >= requiredVersion.minor &&
  (actualVersion.minor > requiredVersion.minor ||
    actualVersion.patch >= requiredVersion.patch);

export const isOlder = (a, b) => {
  if (a.major < b.major) {
    return true;
  }
  if (a.major > b.major) {
    return false;
  }
  if (a.minor < b.minor) {
    return true;
  }
  if (a.minor > b.minor) {
    return false;
  }
  return a.patch < b.patch;
};

export const formatVersion = (version) => `${version.major}.${version.minor}.${version.patch}`;
