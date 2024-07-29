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
    {
        id   : 'UserList',
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
    },
    {
        id   : 'RemoteWorkScheduler',
        title: 'Scheduler ',
        type : 'basic',
        icon : 'heroicons_outline:user-group',
        link : '/RemoteWorkScheduler'
    }
];
