import type { DesktopApp } from "../desktop.ts";
import { leadsApp } from "./leads.ts";
import { mailApp } from "./mail.ts";

/** Taskbar order. Add new apps here. */
export const apps: ReadonlyArray<DesktopApp> = [mailApp, leadsApp];
