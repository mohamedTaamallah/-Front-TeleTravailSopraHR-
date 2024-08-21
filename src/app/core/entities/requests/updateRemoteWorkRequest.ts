import { RemoteWorkRequestStatus } from '../RemoteWorkRequestStatus';

export class UpdateRemoteWorkRequest {
    remoteWorkRequestID: number; // Use number for Long in TypeScript
    remoteWorkRequestStatus: RemoteWorkRequestStatus;

    constructor(
        remoteWorkRequestID: number,
        remoteWorkRequestStatus: RemoteWorkRequestStatus
    ) {
        this.remoteWorkRequestID = remoteWorkRequestID;
        this.remoteWorkRequestStatus = remoteWorkRequestStatus;
    }
}
