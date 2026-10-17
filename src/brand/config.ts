/**
 * Central brand configuration for your channel.
 *
 * This project was created as a Proof of Concept ("Sudo the Raccoon" / @sudoraccoon).
 * To run this pipeline under your own channel name, handle, and mascot:
 * 1. Edit the values below (used by Cover, EndCard, ProfilePicture, and Terminal).
 * 2. Set CHANNEL_HANDLE and CHANNEL_NAME in your `.env` file for the Python scripts.
 */
export const BRAND = {
  /** Display name of your channel / character */
  name: "Sudo the Raccoon",
  /** Social handle shown on covers and the closing EndCard */
  handle: "@sudoraccoon",
  /** Default closing tagline below the handle on the EndCard */
  tagline: "Follow for more terminal tricks.",
  /** Path inside `public/` used for the EndCard avatar and profile picture */
  avatar: "raccoon/closeup-face.png",
  /** Default macOS terminal window title */
  terminalTitle: "sudo@laptop: ~",
} as const;
