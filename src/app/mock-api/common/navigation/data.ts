/* tslint:disable:max-line-length */
import { FuseNavigationItem } from '@fuse/components/navigation';

export const defaultNavigation: FuseNavigationItem[] = [
    /* admin routes */
    {
        id: 'admin',
        title: 'Admin',
        subtitle: 'Available Only for Admin',
        type: 'group',
        icon: 'heroicons_outline:home',
        children: [
            {
                id: 'UserList',
                title: 'Pending user Requests',
                type: 'basic',
                icon: 'heroicons_outline:user',
                link: '/UsersList',
            },
            {
                id: 'TeamManagment',
                title: 'Team management ',
                type: 'basic',
                icon: 'heroicons_outline:user-group',
                link: '/TeamManagment',
            },
        ],
    },
    /* Collaborator routes */
    {
        id: 'Collaborator',
        title: 'Collaborator',
        subtitle: 'Available Only for Collaborator',
        type: 'group',
        icon: 'heroicons_outline:home',
        children: [
            {
                id: 'RemoteWorkScheduler',
                title: 'Scheduler ',
                type: 'basic',
                icon: 'heroicons_outline:calendar',
                link: '/RemoteWorkScheduler',
            },
        ],
    },
    /* Manager routes */
    {
        id: 'managers',
        title: 'Manager',
        subtitle: 'Available Only for managers',
        type: 'group',
        icon: 'heroicons_outline:home',
        children: [
            {
                id: 'RemoteWorkRequestList',
                title: 'Remote Work Request List ',
                type: 'basic',
                icon: 'heroicons_outline:newspaper',
                link: '/RemoteWorkRequestList',
            },
            {
                id: 'BlockedDaysManagment',
                title: 'Blocked Days Managment ',
                type: 'basic',
                icon: 'heroicons_outline:newspaper',
                link: '/BlockedkDays',
            },
            {
                id: 'TeamMembers',
                title: 'Team Members ',
                type: 'basic',
                icon: 'heroicons_outline:newspaper',
                link: '/TeamMembers',
            },
        ],
    },
];

export const compactNavigation: FuseNavigationItem[] = [
    {
        id: 'example',
        title: 'Example',
        type: 'basic',
        icon: 'heroicons_outline:chart-pie',
        link: '/example',
    },
];
export const futuristicNavigation: FuseNavigationItem[] = [
    {
        id: 'example',
        title: 'Example',
        type: 'basic',
        icon: 'heroicons_outline:chart-pie',
        link: '/example',
    },
];
export const horizontalNavigation: FuseNavigationItem[] = [
    /* admin routes */
    {
        id: 'admin',
        title: 'Admin',
        subtitle: 'Available Only for Admin',
        type: 'group',
        icon: 'heroicons_outline:home',
        children: [
            {
                id: 'UserList',
                title: 'Pending user Requests',
                type: 'basic',
                icon: 'heroicons_outline:user',
                link: '/UsersList',
            },
            {
                id: 'TeamManagment',
                title: 'Team management ',
                type: 'basic',
                icon: 'heroicons_outline:user-group',
                link: '/TeamManagment',
            },
        ],
    },
    /* Collaborator routes */
    {
        id: 'Collaborator',
        title: 'Collaborator',
        subtitle: 'Available Only for Collaborator',
        type: 'group',
        icon: 'heroicons_outline:home',
        children: [
            {
                id: 'RemoteWorkScheduler',
                title: 'Scheduler ',
                type: 'basic',
                icon: 'heroicons_outline:calendar',
                link: '/RemoteWorkScheduler',
            },
        ],
    },
    /* Manager routes */
    {
        id: 'managers',
        title: 'Manager',
        subtitle: 'Available Only for managers',
        type: 'group',
        icon: 'heroicons_outline:home',
        children: [
            {
                id: 'RemoteWorkRequestList',
                title: 'Remote Work Request List ',
                type: 'basic',
                icon: 'heroicons_outline:newspaper',
                link: '/RemoteWorkRequestList',
            },
            {
                id: 'BlockedDaysManagment',
                title: 'Blocked Days Managment ',
                type: 'basic',
                icon: 'heroicons_outline:newspaper',
                link: '/BlockedkDays',
            },
            {
                id: 'TeamMembers',
                title: 'Team Members ',
                type: 'basic',
                icon: 'heroicons_outline:newspaper',
                link: '/TeamMembers',
            },
        ],
    },
];
