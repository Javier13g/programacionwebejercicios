import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/auth.service';

interface NavItem {
  path: string;
  label: string;
  icon: string;
  exact?: boolean;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly isAuthenticated = computed(() => this.auth.isAuthenticated());
  readonly currentUser = computed(() => this.auth.currentUser());

  readonly navItems: NavItem[] = [
    { path: '/productos', label: 'Productos', icon: 'bi-box-seam' },
    { path: '/movimientos', label: 'Movimientos', icon: 'bi-arrow-left-right' }
  ];

  initials(): string {
    const u = this.currentUser();
    if (!u?.username) return '?';
    const parts = u.username.split(/[._\s-]+/).filter(Boolean);
    if (parts.length === 0) return u.username.charAt(0).toUpperCase();
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }

  logout(): void {
    this.auth.logout();
  }
}
