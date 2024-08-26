/* tslint:disable:max-line-length */
import { FuseNavigationItem } from '@fuse/components/navigation';

export const defaultNavigation: FuseNavigationItem[] = [
    {
        id   : 'Pending User Requests',
        title: 'Pending user Requests',
        type : 'basic',
        icon : 'heroicons_outline:user',
        link : '/UsersList'
    },
    {
        id   : 'example',
        title: 'Team management ',
        type : 'basic',
        icon : 'heroicons_outline:user-group',
        link : '/TeamManagment'
    }
];
export const compactNavigation: FuseNavigationItem[] = [
    {
        id   : 'example',
        title: 'Example',
        type : 'basic',
        icon : 'heroicons_outline:chart-pie',
        link : '/example'
    }
];
export const futuristicNavigation: FuseNavigationItem[] = [
    {
        id   : 'example',
        title: 'Example',
        type : 'basic',
        icon : 'heroicons_outline:chart-pie',
        link : '/example'
    }
];
export const horizontalNavigation: FuseNavigationItem[] = [
    /* admin routes */
    {
        id   : 'UserList',
        title: 'Pending user Requests',
        type : 'basic',
        icon : 'heroicons_outline:user',
        link : '/UsersList'
    },
    {
        id   : 'TeamManagment',
        title: 'Team management ',
        type : 'basic',
        icon : 'heroicons_outline:user-group',
        link : '/TeamManagment'
    },
        /* Collaborator routes */
    {
        id   : 'RemoteWorkScheduler',
        title: 'Scheduler ',
        type : 'basic',
        icon : 'heroicons_outline:calendar',
        link : '/RemoteWorkScheduler'
    },
     /* Manager routes */
    {
        id   : 'RemoteWorkRequestList',
        title: 'Remote Work Request List ',
        type : 'basic',
        icon : 'heroicons_outline:newspaper',
        link : '/RemoteWorkRequestList'
    },
    {
        id   : 'BlockedDaysManagment',
        title: 'Blocked Days Managment ',
        type : 'basic',
        icon : 'heroicons_outline:newspaper',
        link : '/BlockedkDays'
    },
    {
        id   : 'TeamMembers',
        title: 'Team Members ',
        type : 'basic',
        icon : 'heroicons_outline:newspaper',
        link : '/TeamMembers'
    }
];
