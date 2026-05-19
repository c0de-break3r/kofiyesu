export const features = {
  /** Portfolio uses room + lab only (no rigged character). Set true only with a valid avatar.glb. */
  avatar: false,
  sounds: true,
  introWave: false,
  startProject: false,
  contactChat: true,
} as const;

export const isFeatureEnabled = (feature: keyof typeof features) => {
  return features[feature];
};
