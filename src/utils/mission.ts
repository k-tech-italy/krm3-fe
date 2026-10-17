import { MissionInterface } from "../restapi/types";

/** Title to show for a mission: drafts may not have one yet. */
export function missionDisplayTitle(
  mission: Pick<MissionInterface, "title" | "city" | "fromDate" | "toDate">
): string {
  if (mission.title) return mission.title;
  return `${mission.city?.name ?? ""} ${mission.fromDate} - ${mission.toDate}`.trim();
}
