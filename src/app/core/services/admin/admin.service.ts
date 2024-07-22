import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../auth/Api/Apis';
import { JwtTokenService } from '../../auth/JWT/jwt-token.service';
import { User } from '../../entities/User';
import { AffectRoleStatusRequest } from 'app/core/entities/AffectRoleStatusRequest';


@Injectable({
  providedIn: 'root'
})
export class AdminService {

  constructor(private http: HttpClient, private jwtService : JwtTokenService) { }

  private UserApiUrl: string = environment.UserApiUrl;
  
  getPendingUsersRequests(): Observable<User[]> {
    return this.http.get<User[]>(`${this.UserApiUrl}/getPendingUsersRequests`)
  }

  affectRoleAndChangeStatus(affectRoleAndChangeStatus:  AffectRoleStatusRequest): Observable<User> {
    return this.http.put<User>(`${this.UserApiUrl}/affectRoleAndChangeStatus`,affectRoleAndChangeStatus)
  }
}