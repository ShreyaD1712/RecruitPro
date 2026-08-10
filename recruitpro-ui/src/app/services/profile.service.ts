import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProfileService {

  private profileImageSubject = new BehaviorSubject<string>(
    localStorage.getItem('profileImage') || ''
  );

  profileImage$ = this.profileImageSubject.asObservable();

  setProfileImage(image: string) {
    localStorage.setItem('profileImage', image);
    this.profileImageSubject.next(image);
  }

  removeProfileImage() {
    localStorage.removeItem('profileImage');
    this.profileImageSubject.next('');
  }
}