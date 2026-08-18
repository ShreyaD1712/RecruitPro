import {
    Component,
    OnInit,
    ChangeDetectorRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCardModule } from '@angular/material/card';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { SkillService } from '../../../services/skill.service';
import { CompanyService } from '../../../services/company.service';
import { AuthService } from '../../../services/auth.service';
@Component({
    selector: 'app-skill-list',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        MatTableModule,
        MatButtonModule,
        MatIconModule,
        MatInputModule,
        MatFormFieldModule,
        MatCardModule,
        MatSelectModule,
        MatTooltipModule
    ],
    templateUrl: './skill-list.component.html',
})
export class SkillListComponent implements OnInit {

    skills: any[] = [];
    companies: any[] = [];
    search = '';
    selectedCompanyId: number | null = null;
    sortBy = 'SkillName';
    order = 'asc';
    page = 1;
    pageSize = 10;
    totalRecords = 0;
    Math = Math;
    loading = false;
    // ==================================================
    // TABLE COLUMNS
    // ==================================================

    displayedColumns = [
        'SkillName',
        'Description',
        'Status',
        'Actions'
    ];
    constructor(
        private skillService: SkillService,
        private companyService: CompanyService,
        public authService: AuthService,
        private router: Router,
        private cdr: ChangeDetectorRef
    ) { }
    ngOnInit(): void {
        this.loadCompanies();
    }

    loadCompanies(): void {
        if (
            this.authService.hasPermission(
                'VIEW_ALL_COMPANIES'
            )
        ) {
            this.companyService.getCompanies(
                '',
                'CompanyName',
                'asc',
                1,
                1000
            ).subscribe({
                next: (response: any) => {
                    this.companies =
                        response.data || [];
                    this.selectedCompanyId = null;
                    this.loadSkills();
                },
                error: (err) => {
                    console.log(
                        'Error loading companies:',
                        err
                    );
                    this.companies = [];
                    this.selectedCompanyId = null;
                    this.loadSkills();
                }
            });
        }
        else {

            const companyId =
                this.authService.getCompanyId();
            if (!companyId) {
                console.log(
                    'Company ID not found.'
                );
                return;
            }
            this.companyService
                .getCompany(companyId)
                .subscribe({
                    next: (company: any) => {
                        this.companies = [
                            company
                        ];
                        this.selectedCompanyId =
                            company.CompanyId;
                        this.loadSkills();
                    },
                    error: (err) => {
                        console.log(
                            'Error loading company:',
                            err
                        );
                        this.companies = [];
                        this.selectedCompanyId =
                            companyId;
                        this.loadSkills();
                    }
                });
        }
    }
    // ==================================================
    // COMPANY CHANGE
    // ==================================================
    companyChanged(): void {
        this.page = 1;
        this.loadSkills();
    }
    // ==================================================
    // LOAD SKILLS
    // ==================================================
    loadSkills(): void {
        this.loading = true;
        this.skillService.getSkills(
            this.search,
            this.selectedCompanyId,
            this.sortBy,
            this.order,
            this.page,
            this.pageSize
        ).subscribe({
            next: (response: any) => {
                this.skills =
                    response.data || [];
                this.totalRecords =
                    response.total_records || 0;
                this.loading = false;
                this.cdr.detectChanges();
            },
            error: (err) => {
                console.log(
                    'Error loading skills:',
                    err
                );
                this.skills = [];
                this.totalRecords = 0;
                this.loading = false;
                this.cdr.detectChanges();
            }
        });
    }
    // ==================================================
    // SEARCH
    // ==================================================
    searchSkills(): void {
        this.page = 1;
        this.loadSkills();
    }
    // ==================================================
    // SORT
    // ==================================================
    sort(column: string): void {
        if (this.sortBy === column) {
            this.order =
                this.order === 'asc'
                    ? 'desc'
                    : 'asc';
        }
        else {
            this.sortBy = column;
            this.order = 'asc';
        }
        this.loadSkills();
    }
    // ==================================================
    // ADD SKILL
    // ==================================================
    addSkill(): void {
        this.router.navigate([
            '/skill/add'
        ]);
    }
    // ==================================================
    // EDIT SKILL
    // ==================================================
    editSkill(id: number): void {
        this.router.navigate([
            '/skill/edit',
            id
        ]);
    }
    // ==================================================
    // DELETE SKILL
    // ==================================================
    deleteSkill(id: number): void {
        if (
            !confirm(
                'Delete this Skill?'
            )
        ) {
            return;
        }
        this.skillService
            .deleteSkill(id)
            .subscribe({
                next: () => {
                    alert(
                        'Skill Deleted Successfully'
                    );

                    if (
                        this.skills.length === 1 &&
                        this.page > 1
                    ) {
                        this.page--;
                    }
                    this.loadSkills();
                },
                error: (err) => {
                    console.log(
                        'Error deleting skill:',
                        err
                    );
                    alert(
                        err.error?.detail ||
                        'Unable to delete skill'
                    );
                }
            });
    }
    // ==================================================
    // PREVIOUS PAGE
    // ==================================================
    previousPage(): void {
        if (this.page > 1) {
            this.page--;
            this.loadSkills();
        }
    }
    // ==================================================
    // NEXT PAGE
    // ==================================================
    nextPage(): void {
        if (
            this.page * this.pageSize <
            this.totalRecords
        ) {
            this.page++;
            this.loadSkills();
        }
    }
}
