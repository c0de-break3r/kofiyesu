import { Howler } from "howler";

/** Avoid Howler auto-resume attempts before a user gesture (Chrome console noise). */
Howler.autoUnlock = false;
