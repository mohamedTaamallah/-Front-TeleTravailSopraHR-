import { RemoteWorkRequest } from "app/core/entities/RemoteWorkRequest";
import { RemoteWorkRequestStatus } from "app/core/entities/RemoteWorkRequestStatus";
import { User } from "app/core/entities/User";

export class Notification {
    id: string;
    title: String =" Remote work Request Update"
    message: string;
    type: RemoteWorkRequestStatus;
    isRead: boolean;
    timestamp: string; // Using string to represent the ISO date format
    user: User;
    remoteWorkRequest: RemoteWorkRequest;

    constructor(
        id: string,
        message: string,
        type: RemoteWorkRequestStatus,
        isRead: boolean = false,
        timestamp: string = new Date().toISOString(),
        user: User,
        remoteWorkRequest: RemoteWorkRequest
    ) {
        this.id = id;
        this.message = message;
        this.type = type;
        this.isRead = isRead;
        this.timestamp = timestamp;
        this.user = user;
        this.remoteWorkRequest = remoteWorkRequest;
    }
}




