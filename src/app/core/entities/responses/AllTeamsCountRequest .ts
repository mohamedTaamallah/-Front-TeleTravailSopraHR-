import { Team } from "../Team";

export class AllTeamsCountRequest {
    team: Team;
    teamMemberCount: number;
  
    constructor(team: Team, teamMemberCount: number) {
      this.team = team;
      this.teamMemberCount = teamMemberCount;
    }
  }
  