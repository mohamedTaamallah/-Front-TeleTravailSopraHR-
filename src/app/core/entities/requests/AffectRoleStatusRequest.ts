import { Role } from "../Role";
import { UserStatus } from "../UserStatus";

export class AffectRoleStatusRequest {
    idUser: number; // Use number for Long in Java
    role: Role;
    status: UserStatus;


    constructor(idUser: number, role: Role, status: UserStatus) {
        this.idUser = idUser;
        this.role = role;
        this.status = status;
    }
}


