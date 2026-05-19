export const features = {
  /** 3D character in hero / about / contact — set false to show room & lab only */
  avatar: false,
  sounds: true,
  introWave: false,
  startProject: false,
  contactChat: true,
} as const;

export const isFeatureEnabled = (feature: keyof typeof features) => {
  return features[feature];
};
