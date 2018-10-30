export const WebGuiVersion = {
  major: 0,
  minor: 1,
  patch: 0
};

export const RequiredSocketApiVersion = {
  major: 0,
  minor: 1,
  patch: 0
};

export const RequiredOpenSpaceVersion = {
  major: 0,
  minor: 12,
  patch: 0
};

export const isCompatible = (actualVersion, requiredVersion) =>
  actualVersion.major === requiredVersion.major &&
  actualVersion.minor >= requiredVersion.minor &&
  (actualVersion.minor > requiredVersion.minor ||
    actualVersion.patch >= requiredVersion.patch);

export const formatVersion = (version) =>
  version.major + '.' + version.minor + '.' + version.patch;
