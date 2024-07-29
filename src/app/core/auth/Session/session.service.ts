import { Injectable } from '@angular/core';
import { FuseNavigationItem } from '@fuse/components/navigation';
import { Team } from 'app/core/entities/Team';
import { User } from 'app/core/entities/User';

@Injectable({
    providedIn: 'root',
})
export class SessionService {
    constructor() {}
    public isAuthenticated: boolean = false;

    saveUser(user: User): any {
        return sessionStorage.setItem('user', JSON.stringify(user));
    }

    getUser(): any {
        const userString = sessionStorage.getItem('user');
        const user: User | null = userString ? JSON.parse(userString) : null;
        return user; // Return the user object instead of the userString
    }

    clearUser(): void {
        sessionStorage.removeItem('user');
    }

    updateAuthentication(state: boolean) {
        this.isAuthenticated = state;
        sessionStorage.setItem(
            'isAuthenticated',
            JSON.stringify(this.isAuthenticated)
        );
    }

    getisAuthenticated(key: string): boolean {
        const value = sessionStorage.getItem(key);
        return value ? JSON.parse(value) : null;
    }

    // session-storage.utils.ts
    setSessionStorage(key: string, value: any): void {
        sessionStorage.setItem(key, JSON.stringify(value));
    }

    getSessionStorage(key: string): any {
        const item = sessionStorage.getItem(key);
        return item ? JSON.parse(item) : null;
    }

    saveNavigationToSession(navigation: FuseNavigationItem[]): void {
        this.setSessionStorage('navigation', navigation);
    }

    getNavigationFromSession(): FuseNavigationItem[] | null {
        return this.getSessionStorage('navigation');
    }

    removeNavigationItem(): void {
        sessionStorage.removeItem('navigation');
        console.log(this.getNavigationFromSession())

    }
}
