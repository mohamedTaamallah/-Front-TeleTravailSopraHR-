import { Route } from '@angular/router';
import { AuthGuard } from 'app/core/auth/guards/authentication/auth.guard';
import { NoAuthGuard } from 'app/core/auth/guards/authentication/noAuth.guard';
import { LayoutComponent } from 'app/layout/layout.component';
import { InitialDataResolver } from 'app/app.resolvers';
import { AuthorizationGuard } from './core/auth/guards/authorization/authorization.guard';

// @formatter:off
/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
export const appRoutes: Route[] = [

    // Redirect empty path to '/example'
    {path: '', pathMatch : 'full', redirectTo: 'UsersList'},

    // Redirect signed-in user to the '/example'
    //
    // After the user signs in, the sign-in page will redirect the user to the 'signed-in-redirect'
    // path. Below is another redirection for that path to redirect the user to the desired
    // location. This is a small convenience to keep all main routes together here on this file.
    {path: 'signed-in-redirect', pathMatch : 'full', redirectTo: 'UsersList'},

    // Auth routes for guests
    {
        path: '',
        component: LayoutComponent,
        data: {
            layout: 'empty'
        },
        children: [
            {path: 'confirmation-required', loadChildren: () => import('app/modules/auth/confirmation-required/confirmation-required.module').then(m => m.AuthConfirmationRequiredModule)},
            {path: 'forgot-password', loadChildren: () => import('app/modules/auth/forgot-password/forgot-password.module').then(m => m.AuthForgotPasswordModule)},
            {path: 'reset-password', loadChildren: () => import('app/modules/auth/reset-password/reset-password.module').then(m => m.AuthResetPasswordModule)},
            {path: 'sign-in', loadChildren: () => import('app/modules/auth/sign-in/sign-in.module').then(m => m.AuthSignInModule)},
            {path: 'sign-up', loadChildren: () => import('app/modules/auth/sign-up/sign-up.module').then(m => m.AuthSignUpModule)},
        ]
    },

    // Auth routes for authenticated users
    {
        path: '',
        canMatch: [AuthGuard],
        component: LayoutComponent,
        data: {
            layout: 'empty'
        },
        children: [
            {path: 'sign-out', loadChildren: () => import('app/modules/auth/sign-out/sign-out.module').then(m => m.AuthSignOutModule)},
            {path: 'unlock-session', loadChildren: () => import('app/modules/auth/unlock-session/unlock-session.module').then(m => m.AuthUnlockSessionModule)}
        ]
    },

    // Landing routes
    {
        path: '',
        component: LayoutComponent,
        data: {
            layout: 'empty'
        },
        children: [
            {path: 'home', loadChildren: () => import('app/modules/landing/home/home.module').then(m => m.LandingHomeModule)},
        ]
    },

    // Admin routes
    {
        path: '',
        canMatch: [AuthGuard],
        canActivate:[AuthorizationGuard],
        data: { expectedRole: 'ADMINISTRATOR' },
        component: LayoutComponent,
        resolve: {
            initialData: InitialDataResolver,
        },
        children: [
            {path: 'UsersList', loadChildren: () => import('app/modules/admin/userRequestsList/userRequestsList.module').then(m => m.UserRequestsListModule)},
            {path: 'TeamManagment', loadChildren: () => import('app/modules/admin/teamManagment/teamManagment.module').then(m => m.teamManagmentModule)},

        ]
    },

    // Collaborator routes
    {
        path: '',
        canMatch: [AuthGuard],
        canActivate:[AuthorizationGuard],
        data: { expectedRole: 'COLLABORATOR' },
        component: LayoutComponent,
        resolve: {
            initialData: InitialDataResolver,
        },
        children: [
            {path: 'RemoteWorkScheduler', loadChildren: () => import('app/modules/collaborator/scheduler/collaboratorScheduler.module').then(m => m.collaboratorSchedulerModule)},

        ]
    },
    // Manager routes
    {
        path: '',
        canMatch: [AuthGuard],
        canActivate:[AuthorizationGuard],
        data: { expectedRole: 'MANAGER' },
        component: LayoutComponent,
        resolve: {
            initialData: InitialDataResolver,
        },
        children: [
            {path: 'RemoteWorkRequestList', loadChildren: () => import('app/modules/manager/remoteWorkRequestList/RemoteWorkRequestList.module').then(m => m.RemoteWorkRequestListModule)},
            {path: 'BlockedkDays', loadChildren: () => import('app/modules/manager/blockedDaysManagment/BlockedDaysManagment.module').then(m => m.BlockedDaysManagmentModule)},
            {path: 'TeamMembers', loadChildren: () => import('app/modules/manager/team managment/teamMemberTable/TeamHandle.module').then(m => m.TeamHandleModule)},

        ]
    },                
    // Error
    {path: 'error', children: [
        {path: '404', loadChildren: () => import('app/modules/error/error-404/error-404.module').then(m => m.Error404Module)},
        {path: '500', loadChildren: () => import('app/modules/error/error-500/error-500.module').then(m => m.Error500Module)}
    ]},
   
];
