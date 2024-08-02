import { RemoteWorkRequestStatus } from "../RemoteWorkRequestStatus";

export class UpdateRemoteWorkRequest {
    remoteWorkRequestID: number; // Use `number` for the Java `Long` type
    remoteWorkRequestStatus: RemoteWorkRequestStatus; // Assuming RemoteWorkRequestStatus is an enum or similar type

    constructor(remoteWorkRequestID: number, remoteWorkRequestStatus: RemoteWorkRequestStatus) {
        this.remoteWorkRequestID = remoteWorkRequestID;
        this.remoteWorkRequestStatus = remoteWorkRequestStatus;
    }
}