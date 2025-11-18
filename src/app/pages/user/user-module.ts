import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { UserRoutingModule } from './user-routing-module';
import { Account } from './account/account';


@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    UserRoutingModule,
    ReactiveFormsModule,
    Account
  ]
})
export class UserModule { }

