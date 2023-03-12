import { ModelInit, MutableModel, __modelMeta__, ManagedIdentifier } from "@aws-amplify/datastore";
// @ts-ignore
import { LazyLoading, LazyLoadingDisabled, AsyncCollection, AsyncItem } from "@aws-amplify/datastore";





type EagerUser = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<User, 'id'>;
    readOnlyFields: 'createdAt' | 'updatedAt';
  };
  readonly id: string;
  readonly Organizations?: (UserOrganization | null)[] | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

type LazyUser = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<User, 'id'>;
    readOnlyFields: 'createdAt' | 'updatedAt';
  };
  readonly id: string;
  readonly Organizations: AsyncCollection<UserOrganization>;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

export declare type User = LazyLoading extends LazyLoadingDisabled ? EagerUser : LazyUser

export declare const User: (new (init: ModelInit<User>) => User) & {
  copyOf(source: User, mutator: (draft: MutableModel<User>) => MutableModel<User> | void): User;
}

type EagerOrganization = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<Organization, 'id'>;
    readOnlyFields: 'createdAt' | 'updatedAt';
  };
  readonly id: string;
  readonly users?: (UserOrganization | null)[] | null;
  readonly Name?: string | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

type LazyOrganization = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<Organization, 'id'>;
    readOnlyFields: 'createdAt' | 'updatedAt';
  };
  readonly id: string;
  readonly users: AsyncCollection<UserOrganization>;
  readonly Name?: string | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

export declare type Organization = LazyLoading extends LazyLoadingDisabled ? EagerOrganization : LazyOrganization

export declare const Organization: (new (init: ModelInit<Organization>) => Organization) & {
  copyOf(source: Organization, mutator: (draft: MutableModel<Organization>) => MutableModel<Organization> | void): Organization;
}

type EagerUserOrganization = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<UserOrganization, 'id'>;
    readOnlyFields: 'createdAt' | 'updatedAt';
  };
  readonly id: string;
  readonly userId?: string | null;
  readonly organizationId?: string | null;
  readonly user: User;
  readonly organization: Organization;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

type LazyUserOrganization = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<UserOrganization, 'id'>;
    readOnlyFields: 'createdAt' | 'updatedAt';
  };
  readonly id: string;
  readonly userId?: string | null;
  readonly organizationId?: string | null;
  readonly user: AsyncItem<User>;
  readonly organization: AsyncItem<Organization>;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

export declare type UserOrganization = LazyLoading extends LazyLoadingDisabled ? EagerUserOrganization : LazyUserOrganization

export declare const UserOrganization: (new (init: ModelInit<UserOrganization>) => UserOrganization) & {
  copyOf(source: UserOrganization, mutator: (draft: MutableModel<UserOrganization>) => MutableModel<UserOrganization> | void): UserOrganization;
}